export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
      <p className="text-gray-400 text-sm mb-12">Last updated: June 2026</p>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Agreement to Terms</h2>
          <p>By accessing or using the CoxBeach platform (website, mobile site, or API), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Booking & Payment</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All prices shown include the room rate, VAT (15%), platform fee (8%), and agent commission (5%) where applicable.</li>
            <li>A booking hold is placed for 10 minutes once you begin checkout. If payment is not completed within this window, the hold is released automatically.</li>
            <li>Bookings are confirmed only upon receipt of verified payment via our supported gateways (bKash, Nagad, Rocket, SSLCommerz).</li>
            <li>You must be at least 18 years old to make a booking.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Cancellation Policy</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>More than 48 hours before check-in:</strong> Full refund.</li>
            <li><strong>24–48 hours before check-in:</strong> 50% refund.</li>
            <li><strong>Less than 24 hours before check-in:</strong> No refund.</li>
            <li>Refunds are processed within 5–7 business days to the original payment method.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Agent Programme</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Agent QR codes carry a 24-hour attribution window starting from the time of scan.</li>
            <li>Commission is credited as pending upon booking confirmation and becomes available after stay completion per our settlement policy.</li>
            <li>CoxBeach reserves the right to revoke or regenerate any agent QR token at any time, effective immediately.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You are responsible for providing accurate booking information including guest name and phone number.</li>
            <li>You must not use the platform for fraudulent, misleading, or unlawful purposes.</li>
            <li>Account credentials are personal and must not be shared.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Hotel Listings</h2>
          <p>Hotels listed on CoxBeach are independently operated. CoxBeach acts as an intermediary marketplace. We verify hotel status before listing but are not responsible for the quality of services provided by hotels beyond what is described in their approved listing.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Privacy</h2>
          <p>Your personal information is handled in accordance with our Privacy Policy. We collect the minimum data necessary to operate the service and comply with Bangladesh data protection requirements.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Governing Law</h2>
          <p>These terms are governed by the laws of the People&apos;s Republic of Bangladesh. Any disputes shall be subject to the jurisdiction of courts in Dhaka, Bangladesh.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. Contact</h2>
          <p>For queries regarding these terms: <a href="mailto:legal@coxbeach.com.bd" className="text-brand-600 hover:underline">legal@coxbeach.com.bd</a></p>
        </section>
      </div>
    </div>
  );
}
