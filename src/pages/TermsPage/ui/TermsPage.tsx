import { LegalPageLayout } from 'widgets/LegalPageLayout';

const TermsPage = () => (
  <LegalPageLayout title="Terms of Service" updated="July 26, 2026">
    <p>
      These terms govern access to Pixaeron. By creating an account or using the service, you
      agree to these terms and the Privacy Policy.
    </p>
    <h2>Accounts</h2>
    <p>
      You must provide accurate information, keep your credentials secure, and promptly report
      suspected unauthorized access. You are responsible for activity performed through your
      account unless prohibited by applicable law.
    </p>
    <h2>Acceptable use</h2>
    <p>
      You may not use Pixaeron to violate law, infringe rights, distribute malware, abuse
      infrastructure, bypass technical limits, probe other accounts, or process content you are
      not authorized to use.
    </p>
    <h2>Your content</h2>
    <p>
      You retain rights in content you submit. When image processing is released, you will
      grant Pixaeron only the limited rights needed to receive, process, store, and return that
      content. Detailed storage, deletion, and paid-plan terms must be published before those
      features launch.
    </p>
    <h2>Service changes and availability</h2>
    <p>
      Features may change as the product develops. We work to provide a secure and reliable
      service, but temporary interruption may occur for maintenance, security, or circumstances
      outside our control.
    </p>
    <h2>Suspension</h2>
    <p>
      We may restrict or suspend access when reasonably necessary to protect users, the
      service, or third parties; investigate abuse; or comply with law. Where appropriate, we
      will provide notice and a way to contact support.
    </p>
    <h2>Production legal review</h2>
    <p>
      Commercial terms covering the operating legal entity, jurisdiction, warranties,
      liability, payments, refunds, and dispute resolution require owner and legal approval
      before paid production services are offered.
    </p>
    <h2>Contact</h2>
    <p>
      Questions about these terms may be sent to{' '}
      <a href="mailto:support@pixaeron.com">support@pixaeron.com</a>.
    </p>
  </LegalPageLayout>
);

export { TermsPage };
