import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Carsight
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See through the marketing hype. Discover the true cost of vehicle ownership.
          </p>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Beyond the Sticker Price
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            A "reliable" Toyota doesn't automatically mean it's the best value. We calculate the
            <span className="font-semibold"> total cost of ownership</span> including:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900">Purchase & Financing</h3>
                <p className="text-gray-600 text-sm">Real costs including interest over time</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900">Fuel Costs</h3>
                <p className="text-gray-600 text-sm">Based on actual efficiency, not EPA estimates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900">Maintenance & Insurance</h3>
                <p className="text-gray-600 text-sm">Regional costs specific to your location</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900">Depreciation & Resale</h3>
                <p className="text-gray-600 text-sm">True value retention over your ownership</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-900">
              <span className="font-semibold">Not just one number:</span> We show best-case, typical,
              and worst-case scenarios so you understand the financial uncertainty.
            </p>
          </div>

          <Link
            href="/compare"
            className="block w-full md:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
          >
            Compare Vehicles Now
          </Link>
        </div>

        {/* Example Use Case */}
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Example: "Should I buy gas or hybrid?"
          </h3>
          <p className="text-gray-600 mb-4">
            The hybrid costs $3,000 more upfront, but saves you money on fuel.
            When do you break even? Is it worth it for your driving habits?
          </p>
          <p className="text-gray-700 font-medium">
            Carsight gives you the exact answer, not marketing spin.
          </p>
        </div>
      </div>
    </div>
  );
}
