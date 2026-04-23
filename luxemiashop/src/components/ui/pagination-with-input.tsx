import { useState, useEffect, useCallback } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationWithInputProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  getPageNumbers: () => (number | 'ellipsis')[];
}

export const PaginationWithInput = ({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  getPageNumbers,
}: PaginationWithInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handlePageChange = useCallback((page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onPageChange]);

  const handleGoToPage = () => {
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        if (currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
        break;
      case 'ArrowRight':
        if (currentPage < totalPages) {
          handlePageChange(currentPage + 1);
        }
        break;
      case 'Home':
        if (currentPage !== 1) {
          e.preventDefault();
          handlePageChange(1);
        }
        break;
      case 'End':
        if (currentPage !== totalPages) {
          e.preventDefault();
          handlePageChange(totalPages);
        }
        break;
    }
  }, [currentPage, totalPages, handlePageChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 space-y-4">
      <Pagination>
        <PaginationContent>
          {/* First Page */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-9 w-9"
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {getPageNumbers().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {/* Last Page */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 w-9"
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({totalCount} products)
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Go to page:</span>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={String(currentPage)}
            className="w-20 h-8 text-center"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToPage}
            disabled={!inputValue || parseInt(inputValue, 10) < 1 || parseInt(inputValue, 10) > totalPages}
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
};
