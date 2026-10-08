import React from 'react';
import Card from '../../components/Card';
import { Eye, FileCheck, Database, Clock } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <div className="flex-col flex gap-6 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 className="text-2xl font-bold">Privacy & Monitoring Notice</h1>
        <p className="text-muted text-sm mt-1">Information regarding platform data collection and monitoring.</p>
      </div>
      
      <Card>
        <div className="flex-col flex gap-6">
          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3"><Eye size={20} className="text-primary-color" /> What is Logged</h2>
            <ul className="flex-col flex gap-2 text-muted ml-6 list-disc">
              <li><strong>Audit Events:</strong> Actions such as policy publication, quiz submissions, and role assignments.</li>
              <li><strong>Login Activity:</strong> Timestamps and IP metadata of authentication events.</li>
              <li><strong>Acknowledgement Records:</strong> Proof of when policies were read and acknowledged.</li>
              <li><strong>Training Records:</strong> Progress in lessons and exact scores/answers from quizzes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3"><FileCheck size={20} className="text-primary-color" /> Who Can See It</h2>
            <p className="text-muted leading-relaxed">
              Your training and policy acknowledgement records are visible to your direct manager and platform administrators. Audit logs containing detailed platform activity are restricted to administrators for security and compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3"><Database size={20} className="text-primary-color" /> Data Retention</h2>
            <p className="text-muted leading-relaxed">
              Compliance records (acknowledgements, quiz attempts) are retained indefinitely as required by industry regulations. System audit logs are rotated and archived according to standard IT policies.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
