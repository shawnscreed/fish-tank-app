// src/components/MainContainer.tsx
export default function MainContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        max-w-5xl   /* never stretch wider than 5xl on desktop */
        w-full
        mx-auto     /* centers horizontally */
        px-4        /* base left & right padding */
        sm:px-6
        md:px-8     /* more padding on bigger screens */
        ${className}
      `}
    >
      {children}
    </div>
  );
}
