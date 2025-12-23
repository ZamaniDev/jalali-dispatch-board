# Jalali Dispatch Board - Budibase Plugin

A custom Budibase plugin providing a monthly dispatch calendar with full Jalali (Persian Solar) calendar support for MSP scheduling.

## Features

- 🗓️ **Jalali Calendar Native Support** - Full Persian Solar calendar (Farvardin to Esfand)
- 🎯 **Drag & Drop Scheduling** - Intuitive technician assignment
- ⚠️ **Real-Time Warnings** - Conflict detection without blocking actions
- 📊 **Hours Tracking** - Company contracts + technician utilization
- 🎨 **Modern UI** - Clean, responsive design
- 🔄 **Live Updates** - Reactive state management

## Installation

### Prerequisites
- Node.js 18+
- Budibase instance (local or cloud)
- Budibase CLI: `npm install -g @budibase/cli`

### Setup
```bash
# Clone repository
git clone https://github.com/zamaniDev/jalali-dispatch-board.git
cd jalali-dispatch-board

# Install dependencies
npm install

# Development (watch mode)
npm run watch

# Build for production
npm run build
```

### Install in Budibase

1. Build the plugin: `npm run build`
2. In Budibase, go to Settings → Plugins
3. Upload the built plugin
4. Add to your app screens

## Configuration

Connect the plugin to your data sources:

- **Schedules Data:** Query returning schedule records
- **Technicians Data:** Query returning technician records  
- **Companies Data:** Query returning company records

## Usage

See `claude.md` for detailed documentation.

## Development

This project is optimized for development with Claude Code (VS Code extension).
```bash
# Start development
npm run watch

# The plugin will auto-reload in Budibase
```

## Tech Stack

- Svelte 5
- moment-jalaali (Jalali calendar)
- svelte-dnd-action (Drag & drop)
- TailwindCSS

## License

MIT

## Author

Arsalan (MODDOM) - Pirasys, Tehran
