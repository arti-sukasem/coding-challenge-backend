
// Get the day difference between the current date and the upcoming events
export const getDaysDifference = (date1: Date, date2: Date): number => {
    // Convert both dates to timestamps
    const timestamp1 = date1.getTime();
    const timestamp2 = date2.getTime();
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Math.abs(timestamp2 - timestamp1);
  
    // Convert the difference to days
    const differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
  
    return differenceInDays;
  }