export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>Radiant College of Engineering &amp; Management</h4>
          <p>Empowering students with knowledge, skills and character since 1998.</p>
        </div>
        <div>
          <h5>Quick Links</h5>
          <ul>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/admissions">Admissions</a></li>
            <li><a href="/faculty">Faculty</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <p>Anantapur, Andhra Pradesh, India</p>
          <p>info@radiantcollege.edu</p>
          <p>+91 98765 00000</p>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Radiant College of Engineering & Management. All rights reserved.
      </div>
    </footer>
  );
}
