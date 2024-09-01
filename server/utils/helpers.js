const helpers = {
    // Sleep/setTimeout
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    // Takes an array of months and returns an array of the appropriate years
    getYears: (months) => {
        const currentYear = new Date().getFullYear();
        const nextYear = new Date().getFullYear() + 1;
        const janIndex = months?.indexOf("Jan");
        const years = months.map((_, monthIndex) => {
            if (monthIndex < janIndex) {
                return currentYear;
            } else if (monthIndex >= janIndex) {
                return nextYear;
            } else {
                return currentYear;
            }
        });

        return years;
    },
};

module.exports = helpers;





