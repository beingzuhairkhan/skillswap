export function getSessionBookedEmailTemplate(
  session: {
    sessionId: string;
    date: string;
    time: string;
    status: string;
    sessionType: string;
  },
  userName: string,
): string {
  const { sessionId, date, time, status, sessionType } = session;

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="text-align: center; color: #333;">🎉 Session Booked Successfully</h2>

    <p style="text-align: center; font-size: 14px; color: #555;">
      Hi <strong>${userName}</strong>,<br/>
      Your session has been booked successfully.
    </p>

    <table style="margin: 20px auto; border-collapse: collapse; width: 80%;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Session ID</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${sessionId}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Date</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Time</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${time}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${status}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${sessionType}</td>
      </tr>
    </table>

    <p style="text-align: center; font-size: 13px; color: #888;">
      Happy Learning 🚀 <br/>
      <strong>SkillSwap Team</strong>
    </p>
  </div>`;
}
