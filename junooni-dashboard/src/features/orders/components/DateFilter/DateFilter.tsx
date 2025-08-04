import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface DateFilterProps {
  selectedDate?: Date;
  selectedDateRange?: { from?: Date; to?: Date };
  onDateSelect?: (date: Date | undefined) => void;
  onDateRangeSelect?: (range: { from?: Date; to?: Date } | undefined) => void;
  onCustomModeToggle?: () => void;
  mode?: 'single' | 'range';
}

const DateFilter: React.FC<DateFilterProps> = ({
  selectedDate,
  selectedDateRange,
  onDateSelect,
  onDateRangeSelect,
  onCustomModeToggle,
  mode = 'single'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({});

  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Helper function to get quick filter dates
  const getQuickFilterDate = (filter: string): Date | { from: Date; to: Date } => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    switch (filter) {
      case 'today':
        return today;
      case 'yesterday':
        return yesterday;
      case 'last7days':
        return { from: weekAgo, to: today };
      case 'last30days':
        return { from: monthAgo, to: today };
      case 'thisMonth':
        return { from: startOfMonth, to: today };
      case 'lastMonth':
        return { from: startOfLastMonth, to: endOfLastMonth };
      default:
        return today;
    }
  };

  // Handle quick filter selection
  const handleQuickFilter = (filter: string) => {
    if (filter === 'custom') {
      // Switch to range mode for custom selection
      onCustomModeToggle?.();
      setTempRange({});
      return; // Don't close the popover, let user select custom range
    }

    const result = getQuickFilterDate(filter);
    
    if (mode === 'single') {
      const date = result instanceof Date ? result : result.to;
      onDateSelect?.(date);
    } else {
      const range = result instanceof Date ? { from: result, to: result } : result;
      onDateRangeSelect?.(range);
      setTempRange({});
    }
    
    setIsOpen(false);
  };

  // Clear filter
  const clearFilter = () => {
    if (mode === 'single') {
      onDateSelect?.(undefined);
    } else {
      onDateRangeSelect?.(undefined);
      setTempRange({});
    }
    setIsOpen(false);
  };

  // Generate calendar days
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Check if date is selected
  const isDateSelected = (date: Date) => {
    if (mode === 'single') {
      return selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
    } else {
      const range = selectedDateRange || tempRange;
      if (!range.from) return false;
      
      if (!range.to) {
        return date.getTime() === range.from.getTime();
      }
      
      return date.getTime() >= range.from.getTime() && date.getTime() <= range.to.getTime();
    }
  };

  // Check if date is in range (for range mode)
  const isDateInRange = (date: Date) => {
    if (mode !== 'range') return false;
    
    const range = selectedDateRange || tempRange;
    if (!range.from || !range.to) return false;
    
    return date.getTime() > range.from.getTime() && date.getTime() < range.to.getTime();
  };

  // Check if date is range start/end
  const isRangeStart = (date: Date) => {
    if (mode !== 'range') return false;
    const range = selectedDateRange || tempRange;
    return range.from && date.getTime() === range.from.getTime();
  };

  const isRangeEnd = (date: Date) => {
    if (mode !== 'range') return false;
    const range = selectedDateRange || tempRange;
    return range.to && date.getTime() === range.to.getTime();
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (mode === 'single') {
      onDateSelect?.(date);
      setIsOpen(false);
    } else {
      const currentRange = tempRange.from ? tempRange : (selectedDateRange || {});
      
      if (!currentRange.from || (currentRange.from && currentRange.to)) {
        // Start new range
        setTempRange({ from: date, to: undefined });
      } else {
        // Complete range
        const newRange = currentRange.from <= date 
          ? { from: currentRange.from, to: date }
          : { from: date, to: currentRange.from };
        
        onDateRangeSelect?.(newRange);
        setTempRange({});
        setIsOpen(false);
      }
    }
  };

  // Navigation functions
  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get display text for the button
  const getDisplayText = () => {
    if (mode === 'single') {
      return selectedDate ? formatDate(selectedDate) : 'Select Date';
    } else {
      if (selectedDateRange?.from && selectedDateRange?.to) {
        return `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`;
      } else if (selectedDateRange?.from) {
        return `${formatDate(selectedDateRange.from)} - ...`;
      }
      return 'Select Date Range';
    }
  };

  const hasFilter = mode === 'single' ? !!selectedDate : !!(selectedDateRange?.from);

  const calendarDays = generateCalendarDays(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`relative ${hasFilter ? 'border-blue-300 bg-blue-50' : ''}`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          <span className="max-w-[200px] truncate">{getDisplayText()}</span>
          {hasFilter && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-blue-500 text-white"
            >
              1
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          {/* Quick Filters */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Quick Filters</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('today')}
                className="justify-start h-8 text-xs"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('yesterday')}
                className="justify-start h-8 text-xs"
              >
                Yesterday
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('last7days')}
                className="justify-start h-8 text-xs"
              >
                Last 7 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('last30days')}
                className="justify-start h-8 text-xs"
              >
                Last 30 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('thisMonth')}
                className="justify-start h-8 text-xs"
              >
                This month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('lastMonth')}
                className="justify-start h-8 text-xs"
              >
                Last month
              </Button>
              
              {/* Custom Date Range Button */}
              <Button
                variant={mode === 'range' ? "default" : "ghost"}
                size="sm"
                onClick={() => handleQuickFilter('custom')}
                className={`justify-start h-8 text-xs col-span-2 ${
                  mode === 'range' 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <CalendarDays className="w-3 h-3 mr-2" />
                {mode === 'range' ? 'Custom Range (Active)' : 'Custom Date Range'}
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-sm font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const selected = isDateSelected(date);
              const inRange = isDateInRange(date);
              const rangeStart = isRangeStart(date);
              const rangeEnd = isRangeEnd(date);
              const currentMonthDate = isCurrentMonth(date);
              const todayDate = isToday(date);

              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-8 w-8 p-0 text-xs relative
                    ${!currentMonthDate ? 'text-gray-400' : ''}
                    ${todayDate ? 'font-bold' : ''}
                    ${selected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${inRange ? 'bg-blue-100 hover:bg-blue-200' : ''}
                    ${rangeStart && !rangeEnd ? 'rounded-r-none' : ''}
                    ${rangeEnd && !rangeStart ? 'rounded-l-none' : ''}
                    ${inRange && !rangeStart && !rangeEnd ? 'rounded-none' : ''}
                  `}
                >
                  {date.getDate()}
                  {todayDate && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t">
            <div className="text-xs text-gray-500">
              {mode === 'range' ? (
                tempRange.from && !tempRange.to ? (
                  'Select end date'
                ) : (
                  'Select start and end dates'
                )
              ) : (
                'Select a date'
              )}
            </div>
            
            <div className="flex gap-2">
              {hasFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilter}
                  className="h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilter;