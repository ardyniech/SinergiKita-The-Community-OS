#!/bin/bash
sed -i 's/import IncidentMap from '\''\.\.\/\.\.\/modules\/map'\'';//g' src/components/organisms/DashboardView.tsx
sed -i 's/case '\''map'\'': return enabledModules.includes('\''map'\'') && <IncidentMap key="map" \/>;//g' src/components/organisms/DashboardView.tsx
