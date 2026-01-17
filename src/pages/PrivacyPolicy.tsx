import EnhancedPageHeader from "@/components/EnhancedPageHeader";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedPageHeader
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information"
      />

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">
              This Privacy Policy explains how A Plus Charge collects, uses, stores, and protects your personal information when you use our website www.APluscharge.com, mobile application, or services.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground mb-4">We may collect the following information:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Name, Email Address, Phone Number</li>
                  <li>Account and login details</li>
                  <li>Payment and transaction information</li>
                  <li>Charging session data</li>
                  <li>Device, browser, and usage information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">We use your information to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide and manage EV charging services</li>
                  <li>Process payments and transactions</li>
                  <li>Improve website and app functionality</li>
                  <li>Communicate service updates and support messages</li>
                  <li>Comply with legal and regulatory obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Sharing of Information</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal data. Information may be shared with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Payment gateway providers</li>
                  <li>Technology and cloud service partners</li>
                  <li>Government or regulatory authorities, if required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement reasonable technical and organizational safeguards to protect your personal data. However, no system is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground mb-4">Personal data is retained only for as long as necessary to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Fulfill service requirements</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground">
                  Our website may use cookies and similar technologies to improve user experience and analyze website traffic. You may control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. User Rights</h2>
                <p className="text-muted-foreground mb-4">You may:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Request access to your personal data</li>
                  <li>Request correction or deletion of your data</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Requests can be sent to the contact details provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our website or app may contain links to third-party websites. A Plus Charge is not responsible for the privacy practices of such third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground">
                  A Plus Charge may update this Privacy Policy from time to time. Updates will be effective upon posting on the website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  For privacy-related questions or requests, contact us at:
                </p>
                <p className="text-muted-foreground mt-2">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:info@alternatev.in" className="text-primary hover:underline">
                    info@alternatev.in
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
