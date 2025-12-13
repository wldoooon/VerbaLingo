import React from 'react';
import { cn } from '@/lib/utils';
import { Disc } from 'lucide-react';

interface FoxLogoProps {
    className?: string;
}

const FoxLogo: React.FC<FoxLogoProps> = ({ className }) => {
    return (
        <div className={cn("flex items-center justify-center text-primary", className)}>
            <Disc size={32} />
        </div>
    );
};

export default FoxLogo;
