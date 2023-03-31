// const { User, Concert } = require('../models');
const User = require('../models/User');
const Concert = require('../models/Concert');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
// const { getArtists } = require('../utils/scraper');
const axios = require('axios');
const cheerio = require('cheerio');

const resolvers = {
    Query: {
        //get the current logged-in User
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('concerts')
                    .populate('friends')
                    .populate('receivedRequests')
                    .populate('sentRequests')
                    .populate('blockedUsers')


                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
        //get all users
        users: async () => {

            const users = User.find()
                .select('-__v -password')
                .populate('concerts')
                .populate('friends');

            console.log(users);
            return users
        },
        //get user by username
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('concerts')
                .populate('friends')
                .populate('sentRequests')
                .populate('receivedRequests')
                .populate('blockedUsers')
        },
        //get all concerts by username.  If no username, get all concerts
        userConcerts: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Concert.find(params).sort({ date: -1 })
                .populate('yes')
                .populate('no')
                .populate('maybe');
        },
        //get a concert by ID
        concert: async (parent, { concertId }) => {
            return Concert.findOne({ _id: concertId })
            // .populate('yes')
            // .populate('no')
            // .populate('maybe');
        },
        //get all concerts in database
        concertsFromDb: async (parent, { date }) => {
            const concerts = await Concert.find({
                date: date
            })
                .sort({ venue: 'asc' })
                .populate('yes')
                .populate('no')
                .populate('maybe')
                .exec();

            return concerts
        },
        //scrape all concerts for the day
        concerts: async (parent, { date }) => {
            // const date = new Date().toDateString();
            const day = date.slice(8, 10);
            const month = (new Date().getMonth()) + 1;
            const year = new Date().getFullYear();

            const url = `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/`
            try {
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);
                var events = [];
                if ($('ul:eq(-1)').length === 0) {
                    $('ul:eq(0) .list-item', data).each(function () {
                        const artists = $(this).find('h2').text()
                        const artistsLink = $(this).find('a').attr('href');
                        const description = $(this).find('.description').text()
                        const dateTime = $(this).find('.date-time').text()
                        const venue = $(this).find('.venue').text()
                        events.push({
                            artists,
                            artistsLink,
                            description,
                            dateTime,
                            venue
                        })
                    })
                } else {
                    $('ul:eq(-1) .list-item', data).each(function () {
                        const artists = $(this).find('h2').text()
                        const artistsLink = $(this).find('a').attr('href');
                        const description = $(this).find('.description').text()
                        const dateTime = $(this).find('.date-time').text()
                        const venue = $(this).find('.venue').text()
                        events.push({
                            artists,
                            artistsLink,
                            description,
                            dateTime,
                            venue
                        })
                    })
                }


                const newEventsArr = await Promise.all(events.map((event) => {
                    const eventUrl = `https://www.austinchronicle.com${event.artistsLink}`;

                    let moreEventDetails = async () => {
                        var { data } = await axios.get(eventUrl)
                        var $ = cheerio.load(data);

                        $('.venue-details:eq(0)', data).each(function () {
                            var address = $(this).text();
                            event["address"] = address
                            return event;
                        })
                        $('.venue-details:eq(1)', data).each(function () {
                            var website = $(this).find('a').attr('href');
                            var email = $(this).find('b:eq(1)').text()
                            event["website"] = website
                            event["email"] = email
                            return event;
                        })
                        $('.ticket-link', data).each(function () {
                            var ticketLink = $(this).attr('href')
                            event["ticketLink"] = ticketLink
                            return event;
                        })
                        return event;
                    }
                    return moreEventDetails();
                }, events))
                return events;
            } catch (err) {
                console.error(err);
            }
        },
        allConcerts: async () => {
            const concerts = await Concert.find()
                .populate('yes')
                .populate('no')
                .populate('maybe');

            return concerts;
        },
        //scrape one day at a time
        austinConcertScraper: async (parent, { date }) => {
            const concertData = [];
            const day = date.slice(8, 10);
            // const month = ('0' + (new Date(date).getMonth()) + 1).slice(-2);
            const month = ('0' + (new Date(date).getMonth() + 1));
            const year = new Date().getFullYear();
            console.log('DATE TO BE SCRAPED: ' + year + '-' + month + '-' + day)
            const urlArr = [
                `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/`,
                `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/page-2`,
                `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/page-3`,
                `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/page-4`
            ];
            await Promise.all(urlArr.map(async (url, index) => {
                try {
                    const { data } = await axios.get(url);
                    const $ = cheerio.load(data);
                    var events = [];
                    if ($('ul:eq(-1)').length === 0) {
                        $('ul:eq(0) .list-item', data).each(function () {
                            const artists = $(this).find('h2').text()
                            const artistsLink = $(this).find('a').attr('href');
                            const description = $(this).find('.description').text()
                            const dateTime = $(this).find('.date-time').text()
                            const venue = $(this).find('.venue').text()
                            const headliner = artists.split(',')[0];
                            const customId = headliner.split(/[,.'\s]+/).join("") + date.split(/[,.'\s]+/).join("") + venue.split(/[,.'\s]+/).join("")
                            const timeArr = dateTime.split(",")
                            const timex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):?([0-5]?[0-9]?)\s*([AaPp][Mm])/
                            let times
                            timeArr.map((time) => {
                                if (timex.test(time)) {
                                    times = time;
                                    return times;
                                }
                            })
                            events.push({
                                customId,
                                artists,
                                artistsLink,
                                description,
                                date,
                                times,
                                venue
                            })
                        })
                    } else {
                        $('ul:eq(-1) .list-item', data).each(function () {
                            const artists = $(this).find('h2').text()
                            const artistsLink = $(this).find('a').attr('href');
                            const description = $(this).find('.description').text()
                            const dateTime = $(this).find('.date-time').text()
                            const venue = $(this).find('.venue').text()
                            const headliner = artists.split(',')[0];
                            const customId = headliner.split(/[,.'\s]+/).join("") + date.split(/[,.'\s]+/).join("") + venue.split(/[,.'\s]+/).join("")
                            const timeArr = dateTime.split(",")
                            const timex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):?([0-5]?[0-9]?)\s*([AaPp][Mm])/
                            let times
                            timeArr.map((time) => {
                                if (timex.test(time)) {
                                    times = time;
                                    return times;
                                }
                            })
                            events.push({
                                customId,
                                artists,
                                artistsLink,
                                description,
                                date,
                                times,
                                venue
                            })
                        })
                    }
                    // console.log('AAAAAAAAAARRRRRRRGGGGGG!!!!!');
                    // console.log(events);
                    const newEventsArr = await Promise.all(events.map((event) => {
                        const eventUrl = `https://www.austinchronicle.com${event.artistsLink}`;

                        let moreEventDetails = async () => {
                            var { data } = await axios.get(eventUrl)
                            var $ = cheerio.load(data);

                            $('.venue-details:eq(0)', data).each(function () {
                                var addressPhone = $(this).text();
                                const addressArr = addressPhone.split(',');
                                //assign regex to recoginze 1-9 to variable num
                                let num = /\d/
                                var address = addressArr[0];
                                var address2 = addressArr[1];
                                var address3 = addressArr[2];
                                if (address2) {
                                    if (num.test(address2[1])) {
                                        event["phone"] = address2;
                                    } else {
                                        event["phone"] = address3;
                                        event["address2"] = address2;
                                    }
                                }
                                event["address"] = address
                                return event;
                            })
                            $('.venue-details:eq(1)', data).each(function () {
                                var website = $(this).find('a').attr('href');
                                var email = $(this).find('b:eq(1)').text()
                                event["website"] = website
                                event["email"] = email
                                return event;
                            })
                            $('.ticket-link', data).each(function () {
                                var ticketLink = $(this).attr('href')
                                event["ticketLink"] = ticketLink
                                return event;
                            })
                            return event;
                        }
                        return moreEventDetails();
                    }, events))
                } catch (error) {
                    console.error(error);
                }
                concertData.push(events);

            }));
            console.log('CONCERTDATA');
            console.log(concertData.length / 2 + ' days of concerts scraped');
            return concertData;
        },



        // //scrape all concerts for the day
        // austinConcertScraper: async (parent, { date }) => {
        //     //delcare empty array for dates
        //     const dateArr = [];
        //     //push todays date into dateArr
        //     dateArr.push(date);
        //     //function to get the next day based on the date passed in to it
        //     const nextDay = (date) => {
        //         const next = new Date(date);
        //         next.setDate(next.getDate() + 1);
        //         const theNextDay = next.toDateString();
        //         return theNextDay;
        //     }
        //     //save date to another variable for for loop
        //     let arrayDate = date;
        //     //for loop that continously gets upcoming dates and pushes them to array
        //     for (let i = 0; i < 3; i++) {
        //         let nextDate = nextDay(arrayDate);
        //         dateArr.push(nextDate);
        //         arrayDate = nextDate;
        //     }
        //     const concertData = [];
        //     await Promise.all(dateArr.map(async (date, index) => {
        //         // const delay = (parseInt(((index + 1) + '000'))) * 30;
        //         // setTimeout(() => {
        //         //     console.log('DELAY: ' + delay);
        //         // }, delay)

        //         const day = date.slice(8, 10);
        //         const month = ('0' + (new Date().getMonth()) + 1).slice(-2);
        //         const year = new Date().getFullYear();
        //         console.log('DATE TO BE SCRAPED: ' + year + '-' + month + '-' + day)
        //         const urlArr = [
        //             `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/`,
        //             `https://www.austinchronicle.com/events/music/${year}-${month}-${day}/page-2`
        //         ];
        //         await Promise.all(urlArr.map(async (url, index) => {
        //             try {
        //                 const { data } = await axios.get(url);
        //                 const $ = cheerio.load(data);
        //                 var events = [];
        //                 if ($('ul:eq(-1)').length === 0) {
        //                     $('ul:eq(0) .list-item', data).each(function () {
        //                         const artists = $(this).find('h2').text()
        //                         const artistsLink = $(this).find('a').attr('href');
        //                         const description = $(this).find('.description').text()
        //                         const dateTime = $(this).find('.date-time').text()
        //                         const venue = $(this).find('.venue').text()
        //                         const headliner = artists.split(',')[0];
        //                         const customId = headliner.split(/[,.'\s]+/).join("") + date.split(/[,.'\s]+/).join("") + venue.split(/[,.'\s]+/).join("")
        //                         const timeArr = dateTime.split(",")
        //                         const timex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):?([0-5]?[0-9]?)\s*([AaPp][Mm])/
        //                         let times
        //                         timeArr.map((time) => {
        //                             if (timex.test(time)) {
        //                                 times = time;
        //                                 return times;
        //                             }
        //                         })
        //                         events.push({
        //                             customId,
        //                             artists,
        //                             artistsLink,
        //                             description,
        //                             date,
        //                             times,
        //                             venue
        //                         })
        //                     })
        //                 } else {
        //                     $('ul:eq(-1) .list-item', data).each(function () {
        //                         const artists = $(this).find('h2').text()
        //                         const artistsLink = $(this).find('a').attr('href');
        //                         const description = $(this).find('.description').text()
        //                         const dateTime = $(this).find('.date-time').text()
        //                         const venue = $(this).find('.venue').text()
        //                         const headliner = artists.split(',')[0];
        //                         const customId = headliner.split(/[,.'\s]+/).join("") + date.split(/[,.'\s]+/).join("") + venue.split(/[,.'\s]+/).join("")
        //                         const timeArr = dateTime.split(",")
        //                         const timex = /([0-9]|0[0-9]|1[0-9]|2[0-3]):?([0-5]?[0-9]?)\s*([AaPp][Mm])/
        //                         let times
        //                         timeArr.map((time) => {
        //                             if (timex.test(time)) {
        //                                 times = time;
        //                                 return times;
        //                             }
        //                         })
        //                         events.push({
        //                             customId,
        //                             artists,
        //                             artistsLink,
        //                             description,
        //                             date,
        //                             times,
        //                             venue
        //                         })
        //                     })
        //                 }
        //                 // console.log('AAAAAAAAAARRRRRRRGGGGGG!!!!!');
        //                 // console.log(events);
        //                 const newEventsArr = await Promise.all(events.map((event) => {
        //                     const eventUrl = `https://www.austinchronicle.com${event.artistsLink}`;

        //                     let moreEventDetails = async () => {
        //                         var { data } = await axios.get(eventUrl)
        //                         var $ = cheerio.load(data);

        //                         $('.venue-details:eq(0)', data).each(function () {
        //                             var address = $(this).text();
        //                             event["address"] = address
        //                             return event;
        //                         })
        //                         $('.venue-details:eq(1)', data).each(function () {
        //                             var website = $(this).find('a').attr('href');
        //                             var email = $(this).find('b:eq(1)').text()
        //                             event["website"] = website
        //                             event["email"] = email
        //                             return event;
        //                         })
        //                         $('.ticket-link', data).each(function () {
        //                             var ticketLink = $(this).attr('href')
        //                             event["ticketLink"] = ticketLink
        //                             return event;
        //                         })
        //                         return event;
        //                     }
        //                     return moreEventDetails();
        //                 }, events))
        //             } catch (error) {
        //                 console.error(error);
        //             }
        //             concertData.push(events);
        //         }))
        //         // ^^^^^URLARR PROMISE END
        //     }))
        //     console.log('CONCERTDATA');
        //     console.log(concertData.length / 2 + ' days of concerts scraped');
        //     return concertData;
        // },
        getYesterdaysConcerts: async (parent, { date }) => {
            console.log('GETYESTERDAYSCONCERTS HAS RUN');
            const yesterdaysConcerts = await Concert.find({ date: date })
                .exec();

            return yesterdaysConcerts;
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        addConcert: async (parent, { ...data }) => {
            await Concert.findOne({ 'customId': data.customId }, async (err, custom) => {
                if (err) return handleError(err);

                if (custom) {
                    const savedConcertId = {
                        _id: custom._id
                    }
                    const update = {
                        artists: data.artists,
                        venue: data.venue,
                        date: data.date,
                        times: data.times,
                        address: data.address,
                        address2: data.address2,
                        phone: data.phone,
                        website: data.website,
                        email: data.email,
                        ticketLink: data.ticketLink,
                    }
                    const updatedConcert = await Concert.findByIdAndUpdate(
                        savedConcertId,
                        update,
                        { new: true }
                    )
                    console.log('UPDATEDCONCERT');
                    console.log(updatedConcert.artists + ' has been updated');
                    return updatedConcert;
                } else {
                    const concert = await Concert.create({ ...data })
                    // .select(-__v);
                    console.log('SAVEDCONCERT');
                    console.log(concert.artists + ' has been added');
                    return concert;
                }
            })
        },
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId } },
                    { new: true }
                ).populate('friends');
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        addConcertToUser: async (parent, { concertId }, context) => {
            console.log(concertId);
            console.log(context.user)
            if (context.user) {
                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { concerts: concertId } },
                    { new: true }
                );
                console.log('ADDED TO USER!!!!!!')
                return user;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        deleteUser: async (parent, { userId }) => {
            console.log(userId);
            const user = await User.deleteOne({ _id: userId });
            console.log(user);
            return "deleted";
        },
        deleteConcertFromUser: async (parent, { concertId }, context) => {
            if (context.user) {

                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { concerts: concertId } },
                    { new: true }
                );

                return user;
            }
        },
        deleteConcert: async (parent, { id }) => {
            const concert = await Concert.deleteOne({ id });
            return concert;
        },
        deleteConcerts: async (parent, { concertId }) => {
            console.log('DELETED IDS');
            console.log(concertId);
            const concerts = await Concert.deleteMany({
                _id: { $in: concertId }
            });
            return concerts
        },
        deleteOldConcerts: async (parent, { date }) => {
            //declare empty array for dates
            const dateArr = [];
            //function to get the previous date based on the date passed into it
            const dayBefore = (date) => {
                const before = new Date(date);
                before.setDate(before.getDate() - 1);
                const theLastDay = before.toDateString();
                return theLastDay;
            }
            //save date to another variable for the for loop
            let arrayDate = date;
            //for loop that gets previous weeks worth of date and pushes the to array
            for (let i = 0; i < 18; i++) {
                let yesterday = dayBefore(arrayDate);
                dateArr.push(yesterday);
                arrayDate = yesterday;
            }
            const oldConcertsArr = []
            //map through array of last weeks dates and delete any shows with that date
            await Promise.all(dateArr.map(async (date) => {
                const concerts = await Concert.find({ date: date })

                await concerts.map((concert) => {
                    oldConcertsArr.push(concert._id);
                })
            }));
            const deletedConcerts = await Concert.deleteMany({
                _id: { $in: oldConcertsArr }
            });
            // returns array of deleted dates
            return dateArr;
            // return deletedConcerts;
        },
        rsvpYes: async (parent, { concertId, userId }, context) => {
            console.log('RSVPYES');
            console.log(concertId + ' and ' + userId);
            if (context.user) {
                const concert = await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $addToSet: { yes: userId } },
                    { new: true }
                );
                await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { no: userId } },
                    { new: true }
                )
                await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { maybe: userId } },
                    { new: true }
                )
                return concert
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        cancelRsvpYes: async (parent, { concertId, userId }, context) => {
            console.log('CANCELRSVPYES');
            console.log(concertId + ' and ' + userId);
            if (context.user) {
                const concert = await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { yes: userId } },
                    { new: true }
                );
                return concert
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        rsvpNo: async (parent, { concertId, userId }, context) => {
            console.log('RSVPNO');
            console.log(concertId + ' and ' + userId);
            if (context.user) {
                const concert = await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $addToSet: { no: userId } },
                    { new: true }
                );
                await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { rsvpYes: userId } },
                    { new: true }
                )
                await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { maybe: userId } },
                    { new: true }
                )
                return concert
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        cancelRsvpNo: async (parent, { concertId, userId }, context) => {
            console.log('CANCELRSVPNO');
            console.log(concertId + ' and ' + userId);
            if (context.user) {
                const concert = await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { no: userId } },
                    { new: true }
                );
                return concert
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        rsvpMaybe: async (parent, { concertId, userId }, context) => {
            console.log('RSVPMAYBE');
            console.log(concertId + ' and ' + userId);
            if (context.user) {
                const concert = await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $addToSet: { maybe: userId } },
                    { new: true }
                );
                await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { yes: userId } },
                    { new: true }
                )
                await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { no: userId } },
                    { new: true }
                )

                return concert
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        cancelRsvpMaybe: async (parent, { concertId, userId }, context) => {
            console.log('CANCELRSVPMAYBE');
            console.log(concertId + ' and ' + userId);
            if (context.user) {
                const concert = await Concert.findByIdAndUpdate(
                    { _id: concertId },
                    { $pull: { maybe: userId } },
                    { new: true }
                );
                return concert
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        sendRequest: async (parent, { friendId, friendName }, context) => {
            console.log('request sent: ' + friendId + ' | ' + friendName);
            if (context.user) {
                if (!friendName) {
                    throw new Error("You must submit a username");
                };
                if (friendName === context.user.username) {
                    throw new Error("Please submit another username");
                };
                const user = await User.findOneAndUpdate(
                    { 'username': friendName },
                    { $addToSet: { receivedRequests: context.user._id } },
                    { new: true }
                ).populate('receivedRequests');
                // //send username to 'sentRequest' field in the senders user profile
                const sender = await User.findOneAndUpdate(
                    { 'username': context.user.username },
                    { $addToSet: { sentRequests: friendId } },
                    { new: true }
                ).populate('sentRequests');

                if (!user) {
                    throw new Error('User does not exist');
                }
                
                return user
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        //takes request away from chosen user's received requests and the senders sent requests if you choose to cancel the friend request
        cancelRequest: async (parent, { friendId, friendName }, context) => {
            console.log('FRIEND REQUEST CANCELLED: ' + friendId + ' | ' + friendName);
            if (context.user) {
                await User.findOneAndUpdate(
                    { 'username': context.user.username },
                    { $pull: { sentRequests: friendId } },
                    { new: true }
                ).populate('sentRequests');

                await User.findOneAndUpdate(
                    { 'username': friendName },
                    { $pull: { receivedRequests: context.user._id } },
                    { new: true }
                ).populate('receivedRequests');
                return friendName
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        //changes your open request from a user to show that it has been accepted
        acceptRequest: async (parent, { senderId, senderName }, context) => {
            console.log('accept request: ' + senderId + ' | ' + senderName);
            if (context.user) {
                await User.findOneAndUpdate(
                    { 'username': senderName },
                    { $pull: { sentRequests: context.user._id } },
                    { new: true }
                )

                await User.findOneAndUpdate(
                    { 'username': context.user.username },
                    { $pull: { receivedRequests: senderId } },
                    { new: true }
                )

                const receiver = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: senderId } },
                    { new: true }
                ).populate('friends');

                const sender = await User.findOneAndUpdate(
                    { _id: senderId },
                    { $addToSet: { friends: context.user._id } },
                    { new: true }
                ).populate('friends');

                return 'friends forever';
            };
            throw new AuthenticationError('You need to be logged i!');

        },
        //remove someones friend request from your own open request list
        declineRequest: async (parent, { senderId, senderName }, context) => {
            console.log('decline request: ' + senderId + ' | ' + senderName);
            if (context.user) {
                await User.findOneAndUpdate(
                    { 'username': senderName },
                    { $pull: { sentRequests: context.user._id } }
                );

                await User.findOneAndUpdate(
                    { 'username': context.user.username },
                    { $pull: { receivedRequests: senderId } }
                );
                return 'request declined: ' + senderId + ' | ' + senderName
            };
            throw new AuthenticationError('You need to be logged in!');
        },
        //remove a friends _id from the friend list of the logged in user
        removeFriend: async (parent, { friendId }, context) => {
            console.log(friendId + " removed from " + context.user.username + "'s friend list");
            if (context.user) {
                let user = await User.findOneAndUpdate(
                    { 'username': context.user.username },
                    { $pull: { friends: friendId } },
                    { new: true }
                ).populate('friends');

                await User.findOneAndUpdate(
                    { '_id': friendId },
                    { $pull: { friends: context.user._id } }
                )
                return user;
            };
            throw new AuthenticationError('You need to be logged in!');
        },
        //add blocked User's _id to blockedUsers field in User model
        blockUser: async (parent, { blockedId }, context) => {
            console.log('USER BLOCKED: ' + blockedId);
            if (context.user) {
                let user = await User.findOneAndUpdate(
                    { '_id': context.user._id },
                    { $push: { blockedUsers: blockedId }},
                    { new: true }
                ).populate('blockedUsers');

                await User.findOneAndUpdate(
                    { '_id': context.user._id },
                    { $pull: { friends: blockedId }},
                    { new: true }
                ).populate('friends');

                await User.findOneAndUpdate(
                    { '_id': blockedId },
                    { $pull: { friends: context.user._id }},
                    { new: true }
                )

                return user;
            };
            throw new AuthenticationError('You need to be logged in!');
        },
        //remove blocked User's _id from blockedUsers field in User model
        unblockUser: async (parent, { blockedId }, context) => {
            console.log('USER UNBLOCKED: ' + blockedId);
            if (context.user) {
                let user = await User.findOneAndUpdate(
                    { '_id': context.user._id },
                    { $pull: { blockedUsers: blockedId }},
                    { new: true }
                )
                return user;
            };
            throw new AuthenticationError('You need to be logged in!');
        }
    }
};
module.exports = resolvers;