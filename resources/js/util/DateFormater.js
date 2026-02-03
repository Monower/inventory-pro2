export const dateFormater = (date) => {
    return new Date(date).toLocaleDateString();
};

export const dateTimeFormater = (date) => {
    return new Date(date).toLocaleString();
};