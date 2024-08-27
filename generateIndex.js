const { JSDOM } = require("jsdom");
const fs = require("fs");

fs.readFile("./src/index.html", "utf8", function (err, data) {
  if (err) throw err;

  data = data.replace(/\.\//g, "../");

  // generate silent version
  const silentDocument = new JSDOM(data);
  const audioElement =
    silentDocument.window.document.getElementById("audio-component");
  audioElement.innerHTML = "";
  audioElement.remove();

  fs.writeFile(
    "./src/s/index.html",
    silentDocument.serialize(),
    function (err) {
      if (err) throw err;
      console.log("Silent version saved!");
    }
  );

  // generate recorded version
  const recordedDocument = new JSDOM(data);
  const recordElement = `<script src="https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/record/rrweb-record.min.js"></script>
    <script>
        var events = [];
        var orderId = 1;
        var recordId = crypto.randomUUID();
        var stopRecord = rrwebRecord({
            emit(event) {
                // push event into the events array
                event.orderId = orderId++
                events.push(event);
            },
            ignoreClass: /^(sakura|audio-output)$/,
            blockClass: /^(sakura|audio-output)$/
        })

        // this function will send events to the backend and reset the events array
        function save() {
            const body = JSON.stringify({
                id: recordId,
                to: receiver,
                events: events
            });
            events = [];
            fetch('https://guest-book-api-taupe.vercel.app/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });
        }

        // save events every 10 seconds
        var saveEventInterval = setInterval(save, 10 * 1000);
        // max record 3 minutes
        var maxRecordDuration = 5 * 60 * 1000;
        setTimeout(function () {
            clearInterval(saveEventInterval);
            stopRecord()
        }, maxRecordDuration)
    </script>`;
  const bodyElement = recordedDocument.window.document.querySelector("body");
  bodyElement.insertAdjacentHTML("beforeend", recordElement);

  fs.writeFile(
    "./src/r/index.html",
    recordedDocument.serialize(),
    function (err) {
      if (err) throw err;
      console.log("Record version saved!");
    }
  );
});
