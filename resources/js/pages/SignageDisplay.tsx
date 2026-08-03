import { useEffect, useRef, useState } from 'react';
import { api } from '@/api/client';
import { useBranch } from '@/hooks/useBranch';
import echo from '@/echo';
import type { PromoItem } from '@/api/types';

interface CallOut {
    ticket_number: string;
    counter_label: string | null;
    priority: string;
}

export default function SignageDisplay() {
    const { branch } = useBranch();
    const [promos, setPromos] = useState<PromoItem[]>([]);
    const [promoIndex, setPromoIndex] = useState(0);
    const [callOut, setCallOut] = useState<CallOut | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (!branch) return;
        api.get<PromoItem[]>(`/branches/${branch.id}/promo-content`).then((res) => setPromos(res.data));
    }, [branch]);

    useEffect(() => {
        if (promos.length === 0) return;
        const seconds = promos[promoIndex]?.display_seconds ?? 8;
        const timer = setTimeout(() => setPromoIndex((i) => (i + 1) % promos.length), seconds * 1000);
        return () => clearTimeout(timer);
    }, [promoIndex, promos]);

    useEffect(() => {
        if (!branch) return;

        const channel = echo.channel(`branch.${branch.id}.signage`);
        channel.listen('.ticket.called', (payload: CallOut) => {
            setCallOut(payload);
            speak(payload);

            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setCallOut(null), 10000);
        });

        return () => {
            echo.leaveChannel(`branch.${branch.id}.signage`);
        };
    }, [branch]);

    function speak(payload: CallOut) {
        if (!('speechSynthesis' in window)) return;
        const counterPart = payload.counter_label ? `, please proceed to ${payload.counter_label}` : '';
        const utterance = new SpeechSynthesisUtterance(
            `Ticket ${payload.ticket_number.split('').join(' ')}${counterPart}`,
        );
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }

    const promo = promos[promoIndex];

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="flex min-h-screen flex-col items-center justify-center p-16 text-center">
                {promo ? (
                    <>
                        <h1 className="mb-6 text-5xl font-bold">{promo.title}</h1>
                        {promo.body && <p className="max-w-3xl text-2xl text-slate-400">{promo.body}</p>}
                    </>
                ) : (
                    <h1 className="text-4xl font-bold text-slate-500">{branch?.name}</h1>
                )}
            </div>

            {callOut && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/95 backdrop-blur">
                    <p className="text-3xl text-emerald-300">Now calling</p>
                    <p className="my-4 text-[10rem] font-bold leading-none">{callOut.ticket_number}</p>
                    {callOut.counter_label && (
                        <p className="text-4xl text-emerald-200">Please proceed to {callOut.counter_label}</p>
                    )}
                </div>
            )}
        </div>
    );
}
