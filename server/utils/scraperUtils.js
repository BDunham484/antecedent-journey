/**
 * Runs an array of async task functions with at most `limit` running concurrently.
 * Tasks are functions that return a Promise (e.g. () => scraper()).
 * Results are returned in the same order as the input tasks array.
 */
const runWithConcurrencyLimit = async (tasks, limit) => {
    const results = new Array(tasks.length);
    const executing = new Set();

    for (let i = 0; i < tasks.length; i++) {
        const index = i;
        const p = tasks[index]().then(result => {
            results[index] = result;
            executing.delete(p);
        });
        executing.add(p);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);
    return results;
};

module.exports = { runWithConcurrencyLimit };
