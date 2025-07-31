'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSearch } from '@/lib/useApi';
import { useAppContext } from '@/context/AppContext';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('General');
  const { dispatch } = useAppContext();
  const { data, error, isLoading, refetch } = useSearch(query, category === 'General' ? null : category);

  const categories = [
    { value: 'General', label: 'General' },
    { value: 'movies', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
    { value: 'games', label: 'Games' },
    { value: 'books', label: 'Books' },
    { value: 'music', label: 'Music' },
  ];

  const handleSearch = () => {
    if (!query.trim()) {
      alert('Please enter a word to search for.');
      return;
    }
    refetch();
  };

  useEffect(() => {
    if (data) {
      const videoIds = data.map((hit) => hit.video_id);
      dispatch({ type: 'LOAD_PLAYLIST', payload: videoIds });
    }
  }, [data, dispatch]);

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center space-x-2">
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
          <CategoryPicker
            categories={categories}
            value={category}
            onChange={setCategory}
          />
          <Input
            type="text"
            placeholder="Search for a word..."
            className="w-full border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {isLoading && <p className="mt-2 text-center">Loading...</p>}
      {error && <p className="mt-2 text-center text-red-500">{error.message}</p>}
    </div>
  );
}

type Category = { value: string; label: string };

function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className="mr-2 flex shrink-0 items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground"
        >
          {value}
          <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder="Filter categories..." className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((cat) => (
                <CommandItem
                  key={cat.value}
                  value={cat.value}
                  onSelect={() => {
                    onChange(cat.label);
                    setOpen(false);
                  }}
                >
                  {cat.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === cat.label ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
