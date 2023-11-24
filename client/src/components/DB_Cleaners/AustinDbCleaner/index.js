import { useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
// import { DELETE_CONCERTS } from "@/utils/mutations";
import { DELETE_CONCERTS } from "../../../utils/mutations";
// import { GET_YESTERDAYS_CONCERTS } from "@/utils/queries";
import { GET_YESTERDAYS_CONCERTS } from "../../../utils/queries";

const AustinDbCleaner = ({ today }) => {
    const [deleteConcerts] = useMutation(DELETE_CONCERTS);

    const getYesterdaysDate = (date) => {
        const before = new Date(date);
        before.setDate(before.getDate() - 2);
        // before.setDate(before.getDate() - 1);
        const yesterday = before.toDateString();
        return yesterday;
    }

    const yesterday = getYesterdaysDate(today);

    // queries yesterdays concerts by date 
    const { data: yesterdaysConcertData } = useQuery(GET_YESTERDAYS_CONCERTS, {
        variables: { date: yesterday }
    })

    useEffect(() => {
        const yesterdaysConcerts = yesterdaysConcertData?.getYesterdaysConcerts || [];

        const yesterdaysIdsArr = [];

        const deleteYesterdaysConcerts = async (yesterdaysConcerts) => {
            for (let i = 0; i < yesterdaysConcerts.length; i++) {
                yesterdaysIdsArr.push(yesterdaysConcerts[i]._id)
            }
            // console.log('YESTERDAYS IDs TO BE DELETED');
            // console.log(yesterdaysIdsArr);
            try {
                await deleteConcerts({
                    variables: { concertId: yesterdaysIdsArr }
                })
            } catch (e) {
                console.error(e)
            }
        };

        deleteYesterdaysConcerts(yesterdaysConcerts);
    }, [deleteConcerts, yesterdaysConcertData?.getYesterdaysConcerts])

    return (
        <h3>
            CLEANER: ✅
        </h3>
    )
}

export default AustinDbCleaner;