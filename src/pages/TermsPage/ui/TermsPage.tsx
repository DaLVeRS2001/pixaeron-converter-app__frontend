import { LegalPageLayout } from 'widgets/LegalPageLayout';
import { PublicFooter } from 'widgets/PublicFooter';

const TermsPage = () => (
  <>
    <LegalPageLayout title="Terms of Service" updated="July 26, 2026">
      <p>
        These terms govern access to Pixaeron. By creating an account or using the service, you
        agree to these terms. The Privacy Policy explains how Pixaeron processes personal data.
      </p>
      <h2>Service operator</h2>
      <p>
        Pixaeron is an independently operated software service provided by Vladislav Biriukov,
        an independent developer based in Russia.
      </p>
      <h2>Accounts</h2>
      <p>
        You must provide accurate information, keep your credentials secure, and promptly
        report suspected unauthorized access. You are responsible for activity performed
        through your account unless prohibited by applicable law.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may not use Pixaeron to violate law, infringe rights, distribute malware, abuse
        infrastructure, bypass technical limits, probe other accounts, or process content you
        are not authorized to use.
      </p>
      <h2>Your content</h2>
      <p>
        You retain rights in content you submit. When image processing is released, you will
        grant Pixaeron only the limited rights needed to receive, process, store, and return
        that content. Detailed storage, deletion, and paid-plan terms must be published before
        those features launch.
      </p>
      <h2>Service changes and availability</h2>
      <p>
        Features may change as the product develops. We work to provide a secure and reliable
        service, but temporary interruption may occur for maintenance, security, or
        circumstances outside our control.
      </p>
      <h2>Suspension</h2>
      <p>
        We may restrict or suspend access when reasonably necessary to protect users, the
        service, or third parties; investigate abuse; or comply with law. Where appropriate, we
        will provide notice and a way to contact support.
      </p>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the applicable laws of the Russian Federation, without
        depriving consumers of mandatory protections provided by the laws that apply to them.
        If Pixaeron introduces paid services, the applicable pricing, payment, cancellation,
        and refund terms will be presented before purchase.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms or Pixaeron may be sent to
        <a href="mailto:support@pixaeron.com">support@pixaeron.com</a>.
      </p>
    </LegalPageLayout>
    <PublicFooter />
  </>
);

export { TermsPage };
