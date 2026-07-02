import { Resend } from "resend";
import fs from "fs";
import path from "path";

const resend = new Resend("re_Qq7MRKk2_KupK4GUkmiQQbZV8hEgeXtFP");

async function sendTestEmail() {
  try {
    // Read the HTML template we just created
    const htmlTemplatePath = path.resolve("./email_template.html");
    let htmlContent = fs.readFileSync(htmlTemplatePath, "utf8");

    // Replace the {{ .Token }} placeholder with a dummy code for the preview
    htmlContent = htmlContent.replace("{{ .Token }}", "592014");

    const data = await resend.emails.send({
      from: "Technova <onboarding@resend.dev>",
      to: ["astucegpt@gmail.com"], // The user's verified Resend account email
      subject: "Aperçu de votre design e-mail TECHNOVA",
      html: htmlContent,
    });

    console.log("Test email sent successfully!", data);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

sendTestEmail();
