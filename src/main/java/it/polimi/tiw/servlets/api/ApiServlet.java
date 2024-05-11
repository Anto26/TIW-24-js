package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import it.polimi.tiw.servlets.DataServlet;

public class ApiServlet extends DataServlet {
    private static final long serialVersionUID = -7297515526911117146L;
    Gson gson = new GsonBuilder().setPrettyPrinting().create();;

	void badRequestResponse(HttpServletResponse response, String message) throws IOException {
		this.badRequestResponse(response, message, 400);
	}
	void badRequestResponse(HttpServletResponse response, String message, int code) throws IOException {
		JsonObject result = new JsonObject();
		result.addProperty("ok", false);
		result.addProperty("result", message);
		PrintWriter out = response.getWriter();
		response.setStatus(code);
		out.write(gson.toJson(result));
	}
	
	void goodRequestResponse(HttpServletResponse response, JsonObject obj) throws IOException {
		JsonObject result = new JsonObject();
		result.addProperty("ok", true);
		result.add("result", obj);
		PrintWriter out = response.getWriter();
		response.setStatus(200);
		out.write(gson.toJson(result));
	}
	void goodRequestResponse(HttpServletResponse response, JsonArray obj) throws IOException {
		JsonObject result = new JsonObject();
		result.addProperty("ok", true);
		result.add("result", obj);
		PrintWriter out = response.getWriter();
		response.setStatus(200);
		out.write(gson.toJson(result));
	}
	void setJsonContent(HttpServletResponse response) {
		response.setHeader("content-type", "application/json");
	}
	
}
