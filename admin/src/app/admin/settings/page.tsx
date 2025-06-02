"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  Database,
  Key,
  AlertCircle,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Configuration
          </h1>
          <p className="text-muted-foreground">
            System configuration is managed through environment variables
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="https://docs.mega-pdf.com/configuration"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Documentation
          </a>
        </div>
      </div>

      {/* Configuration Notice */}
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <div>
            <p className="font-medium">Environment Variable Configuration</p>
            <p className="text-sm">
              This system uses environment variables for configuration. To
              change settings, update your .env file or deployment environment
              variables and restart the application.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Instructions */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Configuration Management</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Environment File Section */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Environment File (.env)
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create or update your .env file in the project root with these
                essential variables:
              </p>
              <div className="p-4 bg-muted rounded-md font-mono text-sm space-y-1">
                <div className="text-green-600"># Security</div>
                <div>JWT_SECRET=your-very-secure-secret-key</div>
                <div></div>
                <div className="text-green-600"># Application URLs</div>
                <div>APP_URL=http://localhost:3000</div>
                <div>API_URL=http://localhost:8080</div>
                <div></div>
                <div className="text-green-600"># Database</div>
                <div>DB_HOST=localhost</div>
                <div>DB_NAME=megapdf</div>
                <div>DB_USER=root</div>
                <div>DB_PASSWORD=your-database-password</div>
                <div></div>
                <div className="text-green-600"># Email (Optional)</div>
                <div>SMTP_HOST=smtp.gmail.com</div>
                <div>SMTP_PORT=587</div>
                <div>SMTP_USER=your-email@gmail.com</div>
                <div>SMTP_PASS=your-app-password</div>
                <div>EMAIL_FROM=noreply@mega-pdf.com</div>
                <div></div>
                <div className="text-green-600"># PayPal (Optional)</div>
                <div>PAYPAL_CLIENT_ID=your-paypal-client-id</div>
                <div>PAYPAL_CLIENT_SECRET=your-paypal-secret</div>
                <div></div>
                <div className="text-green-600"># Google OAuth (Optional)</div>
                <div>GOOGLE_CLIENT_ID=your-google-client-id</div>
                <div>GOOGLE_CLIENT_SECRET=your-google-secret</div>
              </div>
            </div>

            {/* Docker Section */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Docker Environment
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                For Docker deployments, set environment variables in
                docker-compose.yml:
              </p>
              <div className="p-4 bg-muted rounded-md font-mono text-sm">
                <div>services:</div>
                <div> api:</div>
                <div> environment:</div>
                <div> - JWT_SECRET=your-secure-secret</div>
                <div> - DB_HOST=database</div>
                <div> - DB_PASSWORD=your-db-password</div>
                <div> - APP_URL=https://your-domain.com</div>
                <div> - SMTP_HOST=smtp.gmail.com</div>
              </div>
            </div>

            {/* Production Section */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Production Deployment
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Set environment variables in your hosting platform:
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm mb-2">Heroku</h4>
                  <div className="p-3 bg-muted rounded-md font-mono text-xs">
                    <div>heroku config:set JWT_SECRET=your-secret</div>
                    <div>heroku config:set DB_HOST=your-db-host</div>
                    <div>
                      heroku config:set APP_URL=https://yourapp.herokuapp.com
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">
                    AWS/Digital Ocean
                  </h4>
                  <div className="p-3 bg-muted rounded-md font-mono text-xs">
                    <div>export JWT_SECRET=your-secret</div>
                    <div>export DB_HOST=your-db-host</div>
                    <div>export APP_URL=https://your-domain.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="font-medium mb-2 text-yellow-800">
                Security Best Practices
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • Generate a secure JWT_SECRET:{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    openssl rand -hex 32
                  </code>
                </li>
                <li>• Use strong database passwords</li>
                <li>
                  • For Gmail SMTP, use App Passwords instead of your regular
                  password
                </li>
                <li>
                  • Never commit .env files with real credentials to version
                  control
                </li>
                <li>• Use HTTPS URLs in production (APP_URL and API_URL)</li>
              </ul>
            </div>

            {/* Current Status */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium mb-2 text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                System Status
              </h3>
              <p className="text-sm text-green-700">
                The application is running and using environment variable
                configuration. If you need to change settings, update your
                environment variables and restart the application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
