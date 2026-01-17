import EnhancedPageHeader from "@/components/EnhancedPageHeader";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedPageHeader
        title="Terms and Conditions"
        subtitle="Please read these terms carefully before using our services"
      />

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">
              Welcome to A Plus Charge. Please read these Terms and Conditions carefully before using our website www.apluscharge.com, mobile application, or services. By accessing or using our website or services, you agree to be bound by these Terms and Conditions.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. About A Plus Charge</h2>
                <p className="text-muted-foreground">
                  A Plus Charge is an electric vehicle (EV) charging infrastructure provider operating and managing EV charging stations across North-East India. We provide EV charging services, digital payment facilities, and information related to charging stations through our website and mobile application.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Services Provided</h2>
                <p className="text-muted-foreground mb-4">A Plus Charge provides:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Information about EV charging station locations</li>
                  <li>Access to EV charging services at supported stations</li>
                  <li>Digital payment options for charging services</li>
                  <li>A cloud-based platform to support charging operations</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  A Plus Charge does not offer advance booking or reservation of charging sessions. Charging services are available on a first-come, first-served basis, subject to charger availability and operational conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Eligibility</h2>
                <p className="text-muted-foreground mb-4">By using our services, you confirm that:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>You are at least 18 years old</li>
                  <li>You are legally capable of entering into a binding agreement under Indian law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. User Accounts</h2>
                <p className="text-muted-foreground mb-4">Users may be required to create an account to access certain services. You agree to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Provide accurate and current information</li>
                  <li>Maintain the confidentiality of your login credentials</li>
                  <li>Be responsible for all activities conducted through your account</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  A Plus Charge shall not be liable for unauthorized access caused by user negligence.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Use of Charging Stations</h2>
                <p className="text-muted-foreground mb-4">Users must:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Follow all safety and usage instructions displayed at charging stations</li>
                  <li>Use charging equipment only for compatible electric vehicles</li>
                  <li>Refrain from damaging, misusing, or tampering with charging infrastructure</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Charging sessions may be interrupted due to maintenance, technical issues, power outages, or safety requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Payments</h2>
                <p className="text-muted-foreground">
                  Payments are processed through authorized third-party payment gateways. Charges are displayed before payment confirmation. A Plus Charge is not responsible for payment failures caused by banks or payment gateway providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Refund Policy</h2>
                <p className="text-muted-foreground mb-4">Refunds may be requested for:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Failed or incomplete charging sessions</li>
                  <li>Incorrect or duplicate transactions</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Refund requests must be made within 6 months of the transaction date. Approved refunds will be processed within 5–7 business days via the original payment method.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Third-Party Links and Services</h2>
                <p className="text-muted-foreground">
                  The website or application may contain links to third-party websites or services. A Plus Charge is not responsible for the content, availability, or accuracy of such third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content, trademarks, logos, software, and materials on the website and application are the exclusive property of A Plus Charge. Unauthorized use is prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-4">Users shall not:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Violate applicable laws or regulations</li>
                  <li>Use automated tools or bots to access the website</li>
                  <li>Interfere with website security or operations</li>
                  <li>Engage in fraudulent, abusive, or harmful activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Suspension and Termination</h2>
                <p className="text-muted-foreground">
                  A Plus Charge reserves the right to suspend or terminate access to its services without prior notice if these Terms are violated or unlawful activity is detected.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  A Plus Charge shall not be liable for any indirect, incidental, or consequential damages arising from the use of its services. Total liability, if any, shall be limited to the amount paid by the user for the relevant service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Indemnification</h2>
                <p className="text-muted-foreground mb-4">
                  You agree to indemnify and hold harmless A Plus Charge from any claims, losses, or damages arising from:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Misuse of services</li>
                  <li>Violation of these Terms</li>
                  <li>Damage to charging infrastructure</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Governing Law and Jurisdiction</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by the laws of India. Courts located in Guwahati shall have exclusive jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">15. Changes to These Terms</h2>
                <p className="text-muted-foreground">
                  A Plus Charge may modify these Terms at any time. Continued use of the website or services constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">16. Contact Information</h2>
                <p className="text-muted-foreground">
                  For any questions regarding these Terms, contact us at:
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

export default TermsAndConditions;
