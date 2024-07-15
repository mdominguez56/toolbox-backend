const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const expect = chai.expect;

chai.use(chaiHttp);

describe("GET /api/files", () => {
  it("should return list of files", (done) => {
    chai
      .request(app)
      .get("/api/files")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});
