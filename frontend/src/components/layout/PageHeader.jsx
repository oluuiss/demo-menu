import './PageHeader.css';

/** Title block at the top of inner pages (sits under the floating header). */
export default function PageHeader({ eyebrow, title, lead, children }) {
  return (
    <section className="page-header">
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {lead && <p className="page-header__lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
