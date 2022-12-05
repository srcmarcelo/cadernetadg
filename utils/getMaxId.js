export const getMaxId = (arr) => {
  const splited_first_id = arr[0].id.split('_');
  let max = splited_first_id[1];
  arr.forEach((item) => {
    const splited_id = item.id.split('_');
    if (parseInt(splited_id[1]) > max) max = parseInt(splited_id[1]);
  });
  return parseInt(max);
};
