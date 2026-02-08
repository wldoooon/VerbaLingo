
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, Pause, Rewind, FastForward, Volume1, Volume2 } from "lucide-react";
import ElasticSlider from "@/components/ElasticSlider";
import TranscriptCarousel from "@/components/features/player/transcript-carousel";

export function PlayerController() {
    return (
        <Card className="w-full bg-card text-white border-zinc-700 rounded-b-lg p-4 border-t-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono">-0:43s</span>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                        <Play className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Rewind className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <FastForward className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 w-1/3">
                    <ElasticSlider 
                        leftIcon={<Volume1 className="h-5 w-5" />}
                        rightIcon={<Volume2 className="h-5 w-5" />}
                        startingValue={0}
                        defaultValue={50}
                        maxValue={100}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="icon">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1 mx-4">
        <TranscriptCarousel />
    </div>
                <Button variant="ghost" size="icon">
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
        </Card>
    );
}
