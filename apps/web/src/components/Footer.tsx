import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🏖️</span>
            <span className="font-bold text-white text-lg">CoxBeach</span>
          </div>
          <p className="text-sm text-gray-400">
            Bangladesh&apos;s trusted platform for Cox&apos;s Bazar hotel bookings.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white transition">Search Hotels</Link></li>
            <li><Link href="/my-bookings" className="hover:text-white transition">My Bookings</Link></li>
            <li><Link href="/agent/register" className="hover:text-white transition">Become an Agent</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="tel:+8801700000000" className="hover:text-white transition">Hotline: 01700-000000</a></li>
            <li><a href="mailto:support@coxbeach.com.bd" className="hover:text-white transition">support@coxbeach.com.bd</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Payments</h4>
          <div className="flex flex-wrap gap-2">
            {['bKash', 'Nagad', 'Rocket', 'SSLCommerz'].map((p) => (
              <span key={p} className="bg-gray-800 text-xs px-2 py-1 rounded">{p}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500 flex justify-between">
        <span>© 2024 CoxBeach. All rights reserved.</span>
        <span>Developed in Bangladesh 🇧🇩</span>
      </div>
    </footer>
  );
}
