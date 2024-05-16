import ejs from "ejs";
import nodemailer, { type Transporter } from "nodemailer";
import path from "path";
import Config from "../config/config";
import { IPackage } from "../domains/package/package-types";

const templateBaseDir = path.join(__dirname, "../../email-templates/");

function initializeTransporter() {
  const transporter: Transporter = nodemailer.createTransport({
    host: Config.Mail.HOST,
    service: Config.Mail.SERVICE,
    port: Config.Mail.PORT,
    auth: {
      user: Config.Mail.USER,
      pass: Config.Mail.PASSWORD
    }
  });
  return transporter;
}

export class EmailService {
  static async sendPasswordResetEmail(
    email: string,
    resetURL: string
  ): Promise<void> {
    const subject = "Password Reset";

    const renderedTemplate = await ejs.renderFile(
      path.join(templateBaseDir, TemplateFileNames.RESET_PASSWORD),
      { link: resetURL }
    );

    await this.sendMail(email, subject, renderedTemplate);
  }

  static async sendPackageUpdateEmail(
    email: string,
    userName: string,
    vpackage: IPackage
  ): Promise<void> {
    const subject = "Package Update";
    const trackingLink = `${Config.FRONTEND_BASE_URL}/packages/tracking/${vpackage.trackingNumber}`;

    const renderedTemplate = await ejs.renderFile(
      path.join(templateBaseDir, TemplateFileNames.PACKAGE_UPDATE),
      { package: { ...vpackage, trackingLink }, name: userName }
    );

    await this.sendMail(email, subject, renderedTemplate);
  }

  static async sendMail(
    email: string,
    subject: string,
    renderedTemplate: string,
    templateName: TemplateFileNames | undefined = undefined
  ): Promise<void> {
    if (renderedTemplate == "" && templateName != undefined) {
      renderedTemplate = await ejs.renderFile(
        path.join(templateBaseDir, templateName)
      );
    }
    const mailOption = {
      from: Config.Mail.USER,
      to: email,
      subject,
      html: renderedTemplate
    };
    const transporter: Transporter = initializeTransporter();

    try {
      await transporter.sendMail(mailOption);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error sending email: ${error.message}`);
      }
    }
  }
}

export enum TemplateFileNames {
  RESET_PASSWORD = "reset-password.ejs",
  RESET_SUCCESSFUL = "reset-successful.ejs",
  PACKAGE_UPDATE = "package-update.ejs"
}
