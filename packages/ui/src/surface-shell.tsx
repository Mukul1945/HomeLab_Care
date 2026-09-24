import type { ReactNode } from 'react';

type SurfaceShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function SurfaceShell({ title, description, children }: SurfaceShellProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: '2.5rem 1.5rem',
        fontFamily: 'Georgia, "Times New Roman", serif',
        background: '#f4f1ea',
        color: '#1f2a24',
      }}
    >
      <section
        style={{
          maxWidth: '42rem',
          margin: '0 auto',
          background: '#fffdf8',
          border: '1px solid #d7d0c4',
          borderRadius: '1rem',
          padding: '2rem',
        }}
      >
        <p style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          HomeLab Care
        </p>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 0.75rem' }}>{title}</h1>
        <p style={{ lineHeight: 1.6, margin: 0 }}>{description}</p>
        {children}
      </section>
    </main>
  );
}
