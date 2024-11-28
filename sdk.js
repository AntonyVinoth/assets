(function () {
  const gatherAdIds = () =>
    Array.from(document.querySelectorAll(".ad-placeholder"))
      .map((el) => el.id)
      .filter((id) => id)
      .join(",");

  const generateSurveyListHTML = (content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Survey List</title>
      <style>
        body { margin: 0; font-family: sans-serif; background-color: #f5f5f7; }
        .survey-list ul { list-style: none; padding: 0; display: flex; flex-direction: column; }
        .survey-list ul li { border: 1px solid #ddd; background-color: #fff; margin: 10px 20px; padding: 15px; }
        .survey-list ul li:hover { background-color: #f0f0f0; }
        .survey-list ul li a { text-decoration: none; color: #007aff; display: flex; justify-content: space-between; width: 100%; }
        .survey-list ul li h3 { font-size: 18px; color: #333; }
      </style>
    </head>
    <body>
      <div class="survey-list">
        <ul id="survey-list">
          ${content.surveys
            .map(
              (survey) => `
            <li>
                <a href="${survey.clickUrl}"><h3>${survey.name}</h3>
                </a>
              </li>
          `
            )
            .join("")}
        </ul>
        <img style="width:1px; height:1px;" src="${
          content.destinationUrl
        }" alt="" />
      </div>
    </body>
    </html>`;

  const loadSurvey = (responseData) => {
    Object.keys(responseData).forEach((id) => {
      const adElement = document.getElementById(id);
      const content = responseData[id];
      if (adElement && content.contentUrl) {
        switch (content.type) {
          case "SURVEY":
            adElement.innerHTML = `
                  <a href="${content.destinationUrl}" id="ad-${id}">
                    <img src="${content.contentUrl}" alt="Survey Image" style="width:100%; height:100%;" />
                    <img style="width:1px; height:1px;" src="${content.impUrl}" alt="" />
                  </a>`;

            document
              .getElementById(`ad-${id}`)
              .addEventListener("click", (e) => {
                e.preventDefault();

                const surveyListHTML = generateSurveyListHTML(content);

                if (window.c1x) {
                  console.log("C1X Channel Available");
                  window.c1x.postMessage(surveyListHTML);
                } else {
                  console.log("c1x Channel Not available");
                  const newWindow = window.open("", "_self");
                  newWindow.document.write(surveyListHTML);
                  newWindow.document.close();
                }
              });
            break;
          case "VIDEO":
            adElement.innerHTML = `
                  <video controls muted poster="https://raw.githubusercontent.com/AntonyVinoth/assets/refs/heads/main/poster_pepsi.png">
                    <source src="${content.contentUrl}" type="video/mp4" />
                  </video>
                  <img style="width:1px; height:1px;" src="${content.impUrl}" alt="" />`;
            console.log("AD typle is VIDEO");
            break;
          default:
            console.log("AD typle is unknown");
        }
      }
    });
  };

  const fetchAds = () => {
    const adIds = gatherAdIds();
    if (adIds) {
      fetch(
        `http://dev-pd.c1exchange.com:8070/v1/promos?invs=${adIds}&rid=${Date.now()}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(loadSurvey)
        .catch((err) => console.error("Error fetching ads:", err));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchAds);
  } else {
    fetchAds();
  }
})();
