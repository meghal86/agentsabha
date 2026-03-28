import Link from "next/link";

import { SansadDarpanSubnav } from "@/components/sansaddarpan-subnav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSansadDarpanMps } from "@/lib/api";

export default async function SansadDarpanMpsPage() {
  const data = await getSansadDarpanMps();

  return (
    <div className="page-shell product-shell" data-product="sansaddarpan">
      <SiteHeader active="sansaddarpan" />

      <main className="screen-main">
        <section className="screen-frame mandate-frame sansaddarpan-frame">
          <div className="product-intro compact-intro">
            <div>
              <p className="eyebrow">MP PARTICIPATION SCORECARD</p>
              <h1 className="product-title">Public scorecards for every sitting Lok Sabha MP</h1>
              <p className="hero-body">
                Attendance, questions, debates, and floor participation are normalized into a public score and benchmarked against national peers.
              </p>
              <p className="frame-note">Methodology version: {data.methodology_version}</p>
            </div>
          </div>

          <SansadDarpanSubnav active="mps" />

          <section className="frame-panel full-width-panel sansaddarpan-surface">
            <div className="section-heading compact-heading">
              <div>
                <p>Participation index</p>
                <h2>MP scorecard register</h2>
              </div>
            </div>
            <div className="sansaddarpan-table-wrap">
              <table className="sansaddarpan-table">
                <thead>
                  <tr>
                    <th>MP</th>
                    <th>Constituency</th>
                    <th>Attendance</th>
                    <th>Questions</th>
                    <th>Debates</th>
                    <th>Score</th>
                    <th>Rank</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.mps.map((mp) => (
                    <tr key={mp.slug}>
                      <td>
                        <strong>{mp.name}</strong>
                        <span>{mp.party}</span>
                      </td>
                      <td>
                        {mp.constituency}
                        <span>{mp.state}</span>
                      </td>
                      <td>{mp.attendance_rate.toFixed(1)}%</td>
                      <td>{mp.questions_asked}</td>
                      <td>{mp.debates}</td>
                      <td>{mp.score}</td>
                      <td>#{mp.national_rank}</td>
                      <td>
                        <Link className="secondary-button forum-open-link" href={`/sansaddarpan/mps/${mp.slug}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter note="SansadDarpan · MP participation benchmarked and method-linked" />
    </div>
  );
}
