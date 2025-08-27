#!/bin/bash

# -------------------
# Remove old pages folder if exists
# -------------------
if [ -d "src/pages" ]; then
  echo "Deleting old src/pages folder..."
  rm -rf src/pages
fi

# -------------------
# Create app folder
# -------------------
mkdir -p src/app

# -------------------
# Pages (App Router)
# -------------------
pages=(
  "appointments/new"
  "clients/new"
  "engagements/new"
  "engagements/[id]"
  "cases/new"
  "cases/[id]"
  "lawyer-recommender"
  "documents/new"
  "documents"
  "calendar"
  "billing"
  "billing/new"
  "closure"
  "users"
  "audit-logs"
  "dashboard"
)

for page in "${pages[@]}"; do
  mkdir -p "src/app/$page"
  echo "export default function Page() { return (<div>$page page placeholder</div>) }" > "src/app/$page/page.tsx"
done

# -------------------
# Components
# -------------------
mkdir -p src/components
components=(
  "AppointmentFormModal"
  "ClientFormModal"
  "ProposalFormModal"
  "ContractViewer"
  "InvoiceFormModal"
  "InvoiceListTable"
  "PaymentStatusTag"
  "CaseForm"
  "CaseTimeline"
  "CaseDetailsTabs"
  "LawyerRecommendationCard"
  "LawyerListTable"
  "DocumentUploadForm"
  "OCRPreview"
  "DocumentListTable"
  "CalendarView"
  "EventTooltip"
  "ClosureForm"
  "ClosureSummary"
  "UserListTable"
  "UserFormModal"
  "RoleBadge"
  "AuditLogTable"
  "LogFilterBar"
  "StatsCard"
  "Charts"
  "RecentActivityFeed"
)

for comp in "${components[@]}"; do
  mkdir -p "src/components/$comp"
  echo "export default function $comp() { return (<div>$comp works!</div>) }" > "src/components/$comp/index.tsx"
done

echo "✅ App Router structure created successfully in src/app!"
