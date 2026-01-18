# Carsight Web

A Next.js web application for calculating and comparing the true Total Cost of Ownership (TCO) for vehicles.

## What is Carsight?

Carsight helps you see through marketing hype and understand the real cost of owning a vehicle. We calculate not just the purchase price, but the complete financial picture including:

- Purchase price, fees, and financing costs
- Fuel costs based on actual efficiency
- Maintenance and insurance (regional)
- Depreciation and resale value
- Uncertainty ranges (best/typical/worst case)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

You'll see the Carsight homepage. Click "Compare Vehicles Now" to see a demo comparison between a Mazda3 regular and hybrid model.

### Building for Production

```bash
npm run build
npm start
```

## Features

### Current (v1)
- ✅ Landing page explaining TCO concept
- ✅ Demo comparison page (Mazda3 Gas vs Hybrid)
- ✅ Real TCO calculations using the Carsight engine
- ✅ Interactive charts showing cumulative costs
- ✅ Break-even analysis
- ✅ Detailed cost breakdown tables

### Coming Soon
- 🔲 Custom vehicle input forms
- 🔲 Vehicle database with auto-fill
- 🔲 User accounts and saved comparisons
- 🔲 Regional benchmark data
- 🔲 Share comparison links

## Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy your Next.js app - it's free for hobby projects!

### Option 1: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Add Carsight web app"
git push
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Connect your GitHub account
5. Select your Carsight repository
6. Vercel will auto-detect Next.js and configure everything
7. Click "Deploy"

That's it! Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and your site will be deployed.

### Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to your main branch
- Create preview deployments for pull requests
- Run builds and show any errors

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── compare/           # Comparison page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/                   # TCO calculation engine
│   ├── core/             # Core computation logic
│   ├── contracts/        # Data schemas & validation
│   └── benchmarks/       # Market reference data
├── public/               # Static assets
│   └── fixtures/         # Demo data (test fixtures)
└── package.json
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Computation**: Pure TypeScript engine (no external APIs)

## How It Works

1. **Client-side computation**: The entire TCO calculation engine runs in your browser - no backend needed for calculations
2. **Test data**: Currently uses pre-loaded test fixtures (Mazda3 comparison)
3. **Real math**: Uses the same calculation engine as the CLI tool

## Development

### Key Files

- `app/page.tsx` - Landing page
- `app/compare/page.tsx` - Vehicle comparison interface
- `lib/core/model.ts` - TCO calculation engine
- `lib/core/compare.ts` - Vehicle comparison logic

### Making Changes

The development server has hot reload enabled - any changes you make to code will automatically refresh in the browser.

## Next Steps

To add custom vehicle input:
1. Create a form component for vehicle details
2. Add state management for user inputs
3. Pass user data to `computeModelOutput()` instead of loading fixtures
4. Add validation using the contract validators

To add a backend:
1. Add API routes in `app/api/`
2. Set up a database (Supabase, Railway, etc.)
3. Create vehicle database and benchmark data tables
4. Add authentication with NextAuth.js

## Support

For issues or questions:
- Check the main Carsight README
- Review the TCO calculation engine documentation
- Open an issue on GitHub

## License

[Add your license here]
