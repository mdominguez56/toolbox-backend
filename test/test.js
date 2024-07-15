const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const expect = chai.expect;

chai.use(chaiHttp);

describe("GET /files/data", () => {
  it("should return reformatted file data", (done) => {
    chai
      .request(app)
      .get("/files/data")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        res.body.forEach((file) => {
          expect(file).to.have.property("file");
          expect(file).to.have.property("lines").that.is.an("array");
          file.lines.forEach((line) => {
            expect(line).to.have.property("text");
            expect(line).to.have.property("number").that.is.a("number");
            expect(line).to.have.property("hex");
          });
        });
        done();
      });
  });
});
