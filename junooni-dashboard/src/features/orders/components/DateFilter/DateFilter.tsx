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

  // Helper function to normalize date to start of day (midnight)
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Helper function to get quick filter dates - FIXED
  const getQuickFilterDate = (filter: string): Date | { from: Date; to: Date } => {
    const today = normalizeDate(new Date());
    
    // Create dates by subtracting milliseconds to avoid month boundary issues
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Start and end of last month
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const results = {
      'today': today,
      'yesterday': yesterday,
      'last7days': { from: weekAgo, to: today },
      'last30days': { from: monthAgo, to: today },
      'thisMonth': { from: startOfMonth, to: today },
      'lastMonth': { from: startOfLastMonth, to: endOfLastMonth }
    };

    return results[filter] || today;
  };

  // Handle quick filter selection - FIXED for immediate UX
  const handleQuickFilter = (filter: string) => {
    if (filter === 'custom') {
      // Switch to range mode for custom selection
      onCustomModeToggle?.();
      setTempRange({});
      return; // Don't close the popover, let user select custom range
    }

    const result = getQuickFilterDate(filter);
    
    // Determine if this filter naturally returns a range
    const rangeFilters = ['last7days', 'last30days', 'thisMonth', 'lastMonth'];
    const isRangeFilter = rangeFilters.includes(filter);
    
    if (isRangeFilter) {
      // For multi-day filters, ALWAYS use range callback and auto-switch mode if needed
      const range = result instanceof Date 
        ? { from: result, to: result } 
        : result;
      
      // Auto-switch to range mode if currently in single mode
      if (mode === 'single' && onCustomModeToggle) {
        onCustomModeToggle();
      }
      
      // Always call the range callback for range filters
      if (onDateRangeSelect) {
        onDateRangeSelect(range);
      } else if (onDateSelect) {
        // Fallback: if no range callback available, use the end date
        const date = range.to || range.from;
        onDateSelect(date);
      }
      setTempRange({});
    } else {
      // For single day filters (today, yesterday)
      const date = result instanceof Date ? result : result.to;
      
      if (mode === 'single' && onDateSelect) {
        onDateSelect(date);
      } else if (mode === 'range' && onDateRangeSelect) {
        // Create single-day range
        onDateRangeSelect({ from: date, to: date });
        setTempRange({});
      } else if (onDateSelect) {
        // Fallback to single date selection
        onDateSelect(date);
      }
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
      days.push(normalizeDate(date)); // Normalize calendar dates too
    }
    
    return days;
  };

  // Check if date is selected - FIXED with proper date comparison
  const isDateSelected = (date: Date) => {
    const normalizedDate = normalizeDate(date);
    
    if (mode === 'single') {
      return selectedDate && 
        normalizedDate.getTime() === normalizeDate(selectedDate).getTime();
    } else {
      const range = selectedDateRange || tempRange;
      if (!range.from) return false;
      
      if (!range.to) {
        return normalizedDate.getTime() === normalizeDate(range.from).getTime();
      }
      
      const fromTime = normalizeDate(range.from).getTime();
      const toTime = normalizeDate(range.to).getTime();
      const dateTime = normalizedDate.getTime();
      
      return dateTime >= fromTime && dateTime <= toTime;
    }
  };

  // Check if date is in range (for range mode) - FIXED
  const isDateInRange = (date: Date) => {
    if (mode !== 'range') return false;
    
    const range = selectedDateRange || tempRange;
    if (!range.from || !range.to) return false;
    
    const normalizedDate = normalizeDate(date);
    const fromTime = normalizeDate(range.from).getTime();
    const toTime = normalizeDate(range.to).getTime();
    const dateTime = normalizedDate.getTime();
    
    return dateTime > fromTime && dateTime < toTime;
  };

  // Check if date is range start/end - FIXED
  const isRangeStart = (date: Date) => {
    if (mode !== 'range') return false;
    const range = selectedDateRange || tempRange;
    return range.from && 
      normalizeDate(date).getTime() === normalizeDate(range.from).getTime();
  };

  const isRangeEnd = (date: Date) => {
    if (mode !== 'range') return false;
    const range = selectedDateRange || tempRange;
    return range.to && 
      normalizeDate(date).getTime() === normalizeDate(range.to).getTime();
  };

  // Handle date click - FIXED
  const handleDateClick = (date: Date) => {
    const normalizedDate = normalizeDate(date);
    
    if (mode === 'single') {
      onDateSelect?.(normalizedDate);
      setIsOpen(false);
    } else {
      const currentRange = tempRange.from ? tempRange : (selectedDateRange || {});
      
      if (!currentRange.from || (currentRange.from && currentRange.to)) {
        // Start new range
        setTempRange({ from: normalizedDate, to: undefined });
      } else {
        // Complete range
        const fromTime = normalizeDate(currentRange.from).getTime();
        const dateTime = normalizedDate.getTime();
        
        const newRange = fromTime <= dateTime 
          ? { from: currentRange.from, to: normalizedDate }
          : { from: normalizedDate, to: currentRange.from };
        
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
    const today = normalizeDate(new Date());
    return normalizeDate(date).getTime() === today.getTime();
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
              className="absolute flex items-center justify-center w-4 h-4 p-0 text-xs text-white bg-blue-500 -top-2 -right-2"
            >
              1
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="start">
        <div className="p-4">
          {/* Quick Filters */}
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium">Quick Filters</h4>
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
                className="justify-start h-8 text-xs border border-blue-200 border-dashed hover:border-blue-400 hover:bg-blue-50"
              >
                Last 7 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('last30days')}
                className="justify-start h-8 text-xs border border-blue-200 border-dashed hover:border-blue-400 hover:bg-blue-50"
              >
                Last 30 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('thisMonth')}
                className="justify-start h-8 text-xs border border-blue-200 border-dashed hover:border-blue-400 hover:bg-blue-50"
              >
                This month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter('lastMonth')}
                className="justify-start h-8 text-xs border border-blue-200 border-dashed hover:border-blue-400 hover:bg-blue-50"
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
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h3 className="text-sm font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="py-2 text-xs font-medium text-center text-gray-500">
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
                    <div className="absolute bottom-0 w-1 h-1 transform -translate-x-1/2 bg-blue-500 rounded-full left-1/2" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 mt-4 border-t">
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