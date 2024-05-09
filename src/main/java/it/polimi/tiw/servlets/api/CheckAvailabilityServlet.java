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
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.servlets.DataServlet;

@WebServlet("/checkAvailability")
public class CheckAvailabilityServlet extends ApiServlet {
    private static final long serialVersionUID = -7297515526960117146L;
    private Gson gson = new Gson();
    
	public CheckAvailabilityServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String username = request.getParameter("username");
		String email = request.getParameter("email");
		response.setHeader("content-type", "application/json");
		JsonObject result = new JsonObject();
		if (username != null) {
			if (username.isEmpty() || username.length() > 30) {
				badRequestResponse(response, "No valid username given");
			} else {
				try {
					Optional<Person> p = personDAO.getFromUsername(username);
					answerRequest(response, p.isPresent());
				} catch (SQLException e) {
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				}
			}
		} else if (email != null){
			if (email.isEmpty() || email.length() > 255) {
				badRequestResponse(response, "No valid email given");
			} else {
				try {
					Optional<Person> p = personDAO.getFromEmail(email);
					answerRequest(response, p.isPresent());
				} catch (SQLException e) {
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				}
			}
		} else {
			badRequestResponse(response, "No email or username parameter given");
			return;
		}
		
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
	
	private void answerRequest(HttpServletResponse response, boolean taken) throws IOException {
		JsonObject result = new JsonObject();
		JsonObject content = new JsonObject();
		result.addProperty("ok", true);
		content.addProperty("taken", taken);
		result.add("result", content);
		PrintWriter out = response.getWriter();
		response.setStatus(200);
		out.write(gson.toJson(result));
	}

}
