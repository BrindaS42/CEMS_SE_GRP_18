// exportUtils.js

export function exportToCSV(data, filename = 'export.csv') {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.map(header => `"${header}"`).join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        const stringValue = value?.toString() || '';
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportRegistrationsToCSV(registrations, events) {
  const exportData = registrations.map(reg => {
    const event = events.find(e => e.id === reg.eventId);
    return {
      'Student Name': reg.studentName,
      'Email': reg.studentEmail,
      'Student ID': reg.studentId,
      'Event': event?.title || 'Unknown Event',
      'Event Date': event?.date || 'Unknown Date',
      'Registration Date': reg.registrationDate,
      'Status': reg.status,
      'Checked In': reg.checkedIn ? 'Yes' : 'No',
      'Check-in Time': reg.checkedInAt || 'N/A'
    };
  });

  const filename = `event-registrations-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
}

export function exportCheckInsToCSV(checkIns, events) {
  const exportData = checkIns.map(checkIn => {
    const event = events.find(e => e.id === checkIn.eventId);
    return {
      'Participant Name': checkIn.studentName,
      'Email': checkIn.studentEmail,
      'Event': event?.title || 'Unknown Event',
      'Event Date': event?.date || 'Unknown Date',
      'Check-in Time': checkIn.checkedInAt,
      'Attendance Status': checkIn.attendanceStatus
    };
  });

  const filename = `event-checkins-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
}