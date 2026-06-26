export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
      <p className="text-gray-400 text-sm mb-12">Last updated: June 2026</p>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        <section className="bg-sand-50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cancellation Refund Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-200">
                  <th className="text-left py-2 font-semibold text-gray-700">When you cancel</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Refund amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                <tr>
                  <td className="py-3">More than 48 hours before check-in</td>
                  <td className="py-3 font-semibold text-green-700">100% full refund</td>
                </tr>
                <tr>
                  <td className="py-3">24–48 hours before check-in</td>
                  <td className="py-3 font-semibold text-yellow-700">50% refund</td>
                </tr>
                <tr>
                  <td className="py-3">Less than 24 hours before check-in</td>
                  <td className="py-3 font-semibold text-red-700">No refund</td>
                </tr>
                <tr>
                  <td className="py-3">No-show (did not check in)</td>
                  <td className="py-3 font-semibold text-red-700">No refund</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">How Refunds Work</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Log in to your CoxBeach account and go to <strong>My Bookings</strong>.</li>
            <li>Find the booking you wish to cancel and click <strong>Cancel Booking</strong>.</li>
            <li>Review the refund amount (calculated automatically based on the policy above) and confirm.</li>
            <li>The cancellation is processed immediately. Your booking status changes to <strong>Cancelled</strong>.</li>
            <li>The refund is sent to the original payment method within <strong>5–7 business days</strong>.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Refund to Payment Methods</h2>
          <div className="space-y-3">
            {[
              { method: 'bKash', timeline: '1–3 business days' },
              { method: 'Nagad', timeline: '1–3 business days' },
              { method: 'Rocket (DBBL)', timeline: '3–5 business days' },
              { method: 'Card / SSLCommerz', timeline: '5–7 business days' },
            ].map((item) => (
              <div key={item.method} className="flex justify-between items-center bg-white border rounded-lg px-4 py-3 text-sm">
                <span className="font-medium text-gray-800">{item.method}</span>
                <span className="text-gray-500">{item.timeline}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Exceptions & Special Cases</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Hotel-initiated cancellations:</strong> If a hotel cancels your confirmed booking, you receive a 100% refund regardless of timing.</li>
            <li><strong>Force majeure:</strong> Natural disasters, government-imposed travel restrictions, or other extraordinary events may qualify for a full refund at our discretion. Contact support within 48 hours with documentation.</li>
            <li><strong>Disputed charges:</strong> If you believe you were charged incorrectly, contact us within 30 days of the transaction.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Agent Commission on Cancellations</h2>
          <p>If a booking with an attributed agent commission is cancelled, the agent commission is reversed. Only commissions for stays that are confirmed and completed are paid out to agents.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Contact Support</h2>
          <p>For refund queries or disputes:</p>
          <ul className="list-none mt-3 space-y-2">
            <li>📞 <a href="tel:+8801700000000" className="text-brand-600 hover:underline">01700-000000</a> (9 AM – 9 PM, 7 days)</li>
            <li>✉️ <a href="mailto:support@coxbeach.com.bd" className="text-brand-600 hover:underline">support@coxbeach.com.bd</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
