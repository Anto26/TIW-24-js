package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.context.WebContext;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
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
	
	void setJsonContent(HttpServletResponse response) {
		response.setHeader("content-type", "application/json");
	}
	
}
