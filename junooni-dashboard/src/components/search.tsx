import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-context'
import { Button } from './ui/button'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '', placeholder = 'Search' }: Props) {
  const { setOpen } = useSearch()
  
  return (
    <Button
      variant='outline'
      className={cn(
        'group relative h-10 w-full flex-1 justify-start rounded-xl bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-600 shadow-sm border-2 border-gray-200/60 transition-all duration-300 ease-out hover:shadow-lg hover:border-[#e65100]/30 hover:bg-white focus:border-[#e65100] focus:ring-4 focus:ring-[#e65100]/10 focus:shadow-lg sm:pr-14 md:w-48 md:flex-none lg:w-64 xl:w-72',
        className
      )}
      onClick={() => setOpen(true)}
    >
      {/* Enhanced Search Icon */}
      <div className='absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 group-hover:text-[#e65100]'>
        <IconSearch
          aria-hidden='true'
          className='h-4 w-4'
        />
      </div>
      
      {/* Placeholder Text */}
      <span className='ml-9 text-gray-500 group-hover:text-gray-700 transition-colors duration-200'>
        {placeholder}
      </span>
      
      {/* Enhanced Keyboard Shortcut */}
      <div className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex'>
        <kbd className='inline-flex h-6 select-none items-center gap-1 rounded-md border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 px-2 font-mono text-[10px] font-semibold text-gray-600 shadow-sm group-hover:border-[#e65100]/20 group-hover:bg-gradient-to-b group-hover:from-[#e65100]/5 group-hover:to-[#e65100]/10 transition-all duration-200'>
          <span className='text-xs'>⌘</span>
          <span>K</span>
        </kbd>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#e65100]/0 via-[#e65100]/0 to-[#e65100]/0 opacity-0 group-hover:opacity-100 group-hover:from-[#e65100]/5 group-hover:via-[#e65100]/10 group-hover:to-[#e65100]/5 transition-all duration-300 pointer-events-none' />
    </Button>
  )
}