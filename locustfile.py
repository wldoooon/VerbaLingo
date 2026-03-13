from locust import HttpUser, task, between


class AbuseTestUser(HttpUser):
    host = "http://localhost:5001"
    wait_time = between(0.1, 0.3)  

    @task(3)
    def anonymous_search(self):
        self.client.get(
            "/api/v1/search?q=test&language=english",
            headers={"X-Forwarded-For": "10.159.156.254:0",
            "X-Real-IP": "10.159.156.254:0"},
        )
