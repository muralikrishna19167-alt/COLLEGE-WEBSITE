export default function Admissions() {
  return (
    <section className="section narrow">
      <h1 className="page-title">Admissions</h1>
      <p>
        Radiant College welcomes applications from students who are passionate about
        engineering and management education. Admissions are based on merit in qualifying
        examinations and entrance test scores as applicable.
      </p>

      <h2>Eligibility Criteria</h2>
      <ul className="bullet-list">
        <li><strong>B.Tech programs:</strong> 10+2 with Physics, Chemistry & Mathematics, minimum 60% aggregate, valid entrance exam score.</li>
        <li><strong>B.Sc Computer Science:</strong> 10+2 with Mathematics/Computer Science, minimum 55% aggregate.</li>
        <li><strong>BBA:</strong> 10+2 in any stream, minimum 50% aggregate.</li>
      </ul>

      <h2>Admission Process</h2>
      <ol className="bullet-list numbered">
        <li>Fill out the online application form with academic details.</li>
        <li>Upload required documents (mark sheets, ID proof, photograph).</li>
        <li>Appear for the entrance test / counselling session (if applicable).</li>
        <li>Receive provisional offer letter and complete fee payment.</li>
        <li>Report to campus for document verification and enrollment.</li>
      </ol>

      <h2>Important Dates (Indicative)</h2>
      <table className="info-table">
        <tbody>
          <tr><td>Application Start</td><td>March 1</td></tr>
          <tr><td>Application Deadline</td><td>June 15</td></tr>
          <tr><td>Entrance Test</td><td>June 25</td></tr>
          <tr><td>Counselling & Admission</td><td>July 1 – July 20</td></tr>
          <tr><td>Classes Commence</td><td>August 1</td></tr>
        </tbody>
      </table>

      <div className="callout">
        <p>
          For admission queries, please reach out via our <a href="/contact">Contact page</a>,
          or email <strong>admissions@radiantcollege.edu</strong>.
        </p>
      </div>
    </section>
  );
}
