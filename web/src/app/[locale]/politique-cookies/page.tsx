import { titleCase, titleSizeClass } from '@/lib/typography'

export default function PolitiqueCookies() {
  return (
    <div className="container-custom max-w-4xl mx-auto py-20 px-4">
      <h1 className={`font-bold text-[#06245F] mb-8 ${titleSizeClass('lg')}`}>
        {titleCase('Politique relative aux cookies')}
      </h1>
      
      <div className="prose prose-gray max-w-none">
        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase("Qu'est-ce qu'un cookie ?")}</h2>
        <p>
          Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d&apos;un site. Il permet de conserver des données utilisateur afin de faciliter la navigation et de permettre certaines fonctionnalités.
        </p>

        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase('Quels cookies utilisons-nous ?')}</h2>
        <ul>
          <li>
            <strong>Cookies strictement nécessaires :</strong> Ils sont indispensables au fonctionnement du site (par exemple, pour mémoriser votre choix de langue ou votre session si vous êtes administrateur). Ils ne nécessitent pas votre consentement.
          </li>
          <li>
            <strong>Cookies tiers (Tripadvisor / Trustindex) :</strong> Lorsque vous acceptez, nous chargeons un widget fourni par Trustindex pour afficher les avis de notre page Tripadvisor. Ce service peut déposer des cookies pour mesurer l&apos;audience ou personnaliser l&apos;affichage. Ces cookies sont soumis à votre consentement préalable.
          </li>
        </ul>

        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase('Comment gérer vos choix ?')}</h2>
        <p>
          Lors de votre première visite, un bandeau vous permet d&apos;accepter ou de refuser le dépôt de ces cookies. Vous pouvez modifier votre choix à tout moment en vidant les cookies de votre navigateur ou en utilisant les paramètres de confidentialité de celui-ci.
        </p>

        <h2 className="text-[clamp(1.25rem,3vw,1.875rem)]">{titleCase('Contact')}</h2>
        <p>
          Pour toute question concernant notre utilisation des cookies, vous pouvez nous contacter à l&apos;adresse : contact@anabo.mg
        </p>
      </div>
    </div>
  )
}