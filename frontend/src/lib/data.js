export const FilterType = {
  all: "tất cả",
  active: "đang làm",
  completed: "hoàn thành",
};

export const options = [
  {
    value: "today",
    label: "Hôm nay",
  },
  {
    value: "week",
    label: "Tuần này",
  },
  {
    value: "month",
    label: "Tháng này",
  },
  {
    value: "all",
    label: "Tất cả",
  },
];

// Số task hiển thị mỗi trang (dùng cho server-side pagination)
export const visibleTaskLimit = 10;
