const backgrounds = {
  landing: '/backgrounds/page_01_home_background.png',
  spinning: '/backgrounds/page_02_spin_background.png',
  generating: '/backgrounds/page_02_spin_background.png',
  result: '/backgrounds/page_03_result_background.png',
};

export default function PageLayout({ children, screen = 'landing' }) {
  return (
    <div className="paper-layout">
      <div
        className="page-artwork"
        style={{ backgroundImage: `url('${backgrounds[screen] || backgrounds.landing}')` }}
        aria-hidden="true"
      />
      <div className="page-content">{children}</div>
    </div>
  );
}
