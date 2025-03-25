import { useState, useEffect, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  getDaysInMonth,
  startOfMonth,
  getDay,
  isSameDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarMinus2, ChevronLeft, ChevronRight } from "lucide-react";
import { Controller, useController } from "react-hook-form";
import Dropdown from "./Dropdown";

const DatePicker = ({
  label,
  control,
  name,
}: {
  label?: string;
  control: any;
  name: string;
}) => {
  const { field } = useController({ name, control });
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const pickerRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const years = Array.from(
    { length: new Date().getFullYear() - 1899 },
    (_, i) => (1900 + i).toString()
  );

  const months = Array.from({ length: 12 }, (_, i) =>
    format(new Date(2000, i, 1), "MMMM")
  );

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getDay(startOfMonth(currentMonth));
    const days = Array.from({ length: firstDay }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  };

  const handleDateSelect = (date: Date | null) => {
    if (date) {
      field.onChange(date);
      setIsOpen(false);
    }
  };

  const handleMonthChange = (next: boolean) => {
    setDirection(next ? 1 : -1);
    setCurrentMonth(
      next ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1)
    );
  };

  const handleYearChange = (selectedYear: string | null) => {
    if (selectedYear !== null) {
      setCurrentMonth(
        new Date(parseInt(selectedYear), currentMonth.getMonth(), 1)
      );
    }
  };

  const handleMonthSelect = (selectedMonth: string | null) => {
    const monthIndex = months.indexOf(selectedMonth);
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
  };

  const calendarDays = generateCalendarDays();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className="flex justify-between items-center active:scale-95 p-[14px] rounded-md border cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base">
          {field.value ? format(field.value, "MM/dd/yyyy") : label}
        </span>
        <CalendarMinus2 className="text-xl" />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.1, type: "spring" }}
            className="absolute mt-2 bg-white border rounded-xl shadow-lg z-10 w-full"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={() => handleMonthChange(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ChevronLeft />
                </button>

                <div className="flex space-x-2 w-full">
                  <Controller
                    name="years"
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        label="Year"
                        options={years}
                        value={currentMonth.getFullYear().toString()}
                        onChange={handleYearChange}
                        // className="py-[4px] text-[12px]"
                      />
                    )}
                  />

                  <Controller
                    name="months"
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        label="Month"
                        options={months}
                        value={months[currentMonth.getMonth()]}
                        onChange={handleMonthSelect}
                      />
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleMonthChange(true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ChevronRight />
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={format(currentMonth, "yyyy-MM")}
                  initial={{ x: direction * 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -direction * 10, opacity: 0 }}
                  transition={{ duration: 0.1, type: "spring" }}
                  className="grid grid-cols-7 gap-[7px] text-center text-sm font-medium"
                >
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-gray-500">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((date, index) => (
                    <div
                      key={index}
                      className={`px-[7px] py-[10px] rounded-full text-center cursor-pointer transition-colors ${
                        date ? "hover:bg-gray-200" : ""
                      } ${
                        date && isSameDay(date, field.value)
                          ? "bg-primary text-white"
                          : ""
                      }`}
                      onClick={() => handleDateSelect(date)}
                    >
                      {date ? date.getDate() : ""}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
