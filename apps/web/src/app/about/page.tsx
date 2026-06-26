export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">About CoxBeach</h1>
      <p className="text-lg text-gray-500 mb-12">Bangladesh&apos;s trusted booking platform exclusively for Cox&apos;s Bazar.</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">
            CoxBeach is a destination-exclusive hotel booking marketplace built specifically for Cox&apos;s Bazar — the world&apos;s longest natural sea beach. We connect travellers with verified hotels along 120 km of pristine coastline, making it easy to find the right property at a fair, transparent price.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We believe booking a hotel should be simple, honest, and fast. Our platform shows the exact price breakdown before you pay — room rate, VAT, platform fee, and agent commission — so there are never any surprises at checkout. A traveller can search real availability, see a fully transparent price, and book using a Bangladeshi payment method in under three minutes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">What Makes Us Different</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            {[
              { icon: '📍', title: 'Cox\'s Bazar Only', desc: 'We focus exclusively on Cox\'s Bazar so every hotel is verified and every listing is accurate.' },
              { icon: '🤝', title: 'Agent Network', desc: 'Our QR-based agent system lets local travel agents earn commissions transparently and get paid on time.' },
              { icon: '💰', title: 'Zero Hidden Fees', desc: 'Every cost component is itemised. Rates are set by administration and never changed without notice.' },
            ].map((item) => (
              <div key={item.title} className="bg-sand-50 rounded-xl p-5">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Pricing Model</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            All fees are calculated on the room subtotal and displayed before you confirm:
          </p>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm space-y-2">
            <div className="flex justify-between"><span>Room price (base)</span><span>100%</span></div>
            <div className="flex justify-between text-gray-500"><span>+ VAT (15%)</span><span>+15%</span></div>
            <div className="flex justify-between text-gray-500"><span>+ Platform fee (8%)</span><span>+8%</span></div>
            <div className="flex justify-between text-gray-500"><span>+ Agent commission (5%, if applicable)</span><span>+5%</span></div>
            <div className="flex justify-between font-bold text-brand-700 border-t pt-2 mt-2"><span>Guest pays</span><span>128% (without agent) / 133%</span></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Rates are admin-configurable and effective immediately platform-wide.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Accepted Payments</h2>
          <p className="text-gray-600 mb-4">We support all major Bangladeshi payment methods:</p>
          <div className="flex flex-wrap gap-3">
            {['bKash', 'Nagad', 'Rocket (DBBL)', 'SSLCommerz (Cards)'].map((p) => (
              <span key={p} className="bg-white border rounded-lg px-4 py-2 text-sm font-medium text-gray-700">{p}</span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Contact Us</h2>
          <div className="space-y-2 text-gray-600">
            <p>📞 Hotline: <a href="tel:+8801700000000" className="text-brand-600 hover:underline">01700-000000</a></p>
            <p>✉️ Email: <a href="mailto:support@coxbeach.com.bd" className="text-brand-600 hover:underline">support@coxbeach.com.bd</a></p>
            <p>🏢 Cox&apos;s Bazar, Chittagong Division, Bangladesh</p>
          </div>
        </section>
      </div>
    </div>
  );
}
