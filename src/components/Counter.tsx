import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SEGMENT_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const;

const DIGIT_SEGMENTS: Record<string, Set<(typeof SEGMENT_KEYS)[number]>> = {
  '0': new Set(['a', 'b', 'c', 'd', 'e', 'f']),
  '1': new Set(['b', 'c']),
  '2': new Set(['a', 'b', 'd', 'e', 'g']),
  '3': new Set(['a', 'b', 'c', 'd', 'g']),
  '4': new Set(['b', 'c', 'f', 'g']),
  '5': new Set(['a', 'c', 'd', 'f', 'g']),
  '6': new Set(['a', 'c', 'd', 'e', 'f', 'g']),
  '7': new Set(['a', 'b', 'c']),
  '8': new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g']),
  '9': new Set(['a', 'b', 'c', 'd', 'f', 'g']),
};

export const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchAndIncrementCounter = async () => {
      // 1. 現在の値を取得
      const { data: currentData } = await supabase
        .from('access_counters')
        .select('count')
        .eq('id', 'top')
        .single();

      const newCount = (currentData?.count ?? 0) + 1;

      // 2. 新しい値で更新
      const { data: updatedData } = await supabase
        .from('access_counters')
        .update({ count: newCount })
        .eq('id', 'top')
        .select()
        .single();

      if (updatedData) {
        setCount(updatedData.count);
      } else {
        setCount(newCount);
      }
    };

    fetchAndIncrementCounter();
  }, []);

  // Format count to 6 digits with leading zeros
  const formattedCount = count.toString().padStart(6, '0');

  return (
    <span className="visitor-counter-display" aria-label={`${formattedCount}人目`}>
      {formattedCount.split('').map((digit, index) => {
        const activeSegments = DIGIT_SEGMENTS[digit] ?? new Set<(typeof SEGMENT_KEYS)[number]>();

        return (
          <span className="seg-digit" key={`${digit}-${index}`}>
            {SEGMENT_KEYS.map((segment) => (
              <span
                key={segment}
                className={`seg seg-${segment}${activeSegments.has(segment) ? ' on' : ''}`}
              />
            ))}
          </span>
        );
      })}
    </span>
  );
};
