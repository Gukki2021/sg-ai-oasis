'use client';

interface Props {
  score: number; // 1–5
  size?: number;
}

export default function StarRating({ score, size = 14 }: Props) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${score} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={n <= score ? '#F59E0B' : 'none'}
            stroke={n <= score ? 'none' : '#C7C7CB'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}
