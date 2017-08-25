define(function (require) {
    "use strict";

    function isFunction(fn) {
        return typeof fn === 'function';
    }

    function isInteger(num) {
        return (Number.isInteger || function (value) {
            return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
        })(num);
    }

    /**
     * @param task the task to be execute
     * @param options
     * @param options.retryTimes, retry times if the task is not success, default 3.
     * @param options.successPredicator, predicate function to check if task is success, default always-success function.
     * @param callback task execution completed callback
     */
    function retry(task, options, callback) {
        var defalutOptions = {
            retryTimes: 3,
            successPredicator: function () {
                return true;
            }
        };
        if (!isFunction(task)) {
            throw new Error("invalid arguments that task should be a function")
        }

        var retryTimes = isInteger(options && options.retryTimes) && options.retryTimes || defalutOptions.retryTimes;
        var successPredicator = isFunction(options && options.successPredicator) && options.successPredicator || defalutOptions.successPredicator;

        var attempt = 0;

        function retryAttempt() {
            task(function (result) {
                if (!successPredicator(result) && attempt++ < retryTimes) {
                    retryAttempt();
                } else {
                    isFunction(callback) && callback(result);
                }
            });
        }

        retryAttempt();
    }

    return retry;
});
